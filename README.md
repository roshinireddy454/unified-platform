# LearnSphere — Unified LMS + Video Conferencing Platform

A fully integrated platform combining the Learning Management System (LMS) with real-time video conferencing. LMS authentication (JWT) controls the entire platform, and video conferencing runs as a seamless module within it.

---

## Architecture Overview

```
unified-platform/
├── server/                  # Express.js backend (Node.js + MongoDB)
│   ├── controllers/
│   │   ├── user.controller.js          # Auth: register, login, logout, profile
│   │   ├── course.controller.js        # Course CRUD, lectures
│   │   ├── courseProgress.controller.js# Track lecture progress
│   │   ├── coursePurchase.controller.js# Stripe payments
│   │   ├── meeting.controller.js       # Stream token, meetings, attendance
│   │   └── summary.controller.js       # PDF summary generation
│   ├── models/
│   │   ├── user.model.js               # LMS user schema (unchanged)
│   │   ├── course.model.js             # Courses
│   │   ├── lecture.model.js            # Lectures
│   │   ├── courseProgress.model.js     # Student progress
│   │   ├── coursePurchase.model.js     # Stripe purchases
│   │   ├── meeting.model.js            # ✨ NEW: Meeting records
│   │   ├── attendance.model.js         # ✨ NEW: Auto attendance
│   │   └── meetingSummary.model.js     # ✨ NEW: MongoDB summaries
│   ├── routes/               # All API routes
│   ├── middlewares/
│   │   └── isAuthenticated.js          # JWT middleware (replaces Clerk)
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── cloudinary.js
│   │   ├── multer.js
│   │   └── pdf.js                      # ✨ PDF generation utility
│   └── index.js                        # Main server entry
│
└── client/                  # React frontend (Vite + Tailwind)
    └── src/
        ├── context/AuthContext.jsx     # JWT auth context
        ├── pages/
        │   ├── AuthPage.jsx            # Login + Register
        │   ├── Dashboard.jsx           # Unified dashboard
        │   ├── CoursesPage.jsx         # Browse/manage courses
        │   ├── CourseDetailPage.jsx    # Course info + enroll
        │   ├── CourseProgressPage.jsx  # Video player + progress
        │   ├── CourseEditorPage.jsx    # Instructor course editor
        │   ├── MeetingsPage.jsx        # Schedule/join meetings
        │   ├── MeetingRoomPage.jsx     # Live video room (Stream SDK)
        │   ├── AttendancePage.jsx      # Attendance tracking
        │   ├── SummariesPage.jsx       # Meeting summaries + PDF
        │   └── ProfilePage.jsx         # User profile management
        └── components/
            ├── Layout.jsx              # Sidebar + navigation
            └── LoadingScreen.jsx
```

---

## Key Integration Changes

### 1. Authentication Migration (Clerk → JWT)
- **Removed**: All Clerk dependencies from video conferencing
- **Added**: `GET /api/v1/meeting/stream-token` endpoint
  - Validates LMS JWT cookie
  - Calls Stream SDK server-side to generate a Stream token
  - Returns `{ token, apiKey, userId, userName }` to frontend
- The frontend uses this token to initialize `StreamVideoClient` directly
- No re-login required — LMS session grants video access automatically

### 2. GetStream Integration (Preserved)
- `StreamVideoClient` initialized with JWT-authenticated user data
- `StreamCall` created using Stream's `default` call type
- All Stream features work: recording, transcripts, screen share, etc.
- Users are upserted in Stream with their LMS profile data

### 3. Database Integration (JSON → MongoDB)
- **Before**: Summaries stored in `data/summaries.json`, attendance in `attendance.json`
- **After**: All data in MongoDB
  - `meetings` collection — meeting metadata
  - `attendances` collection — per-user join/leave records
  - `meetingsummaries` collection — transcripts, summaries, PDF paths

### 4. Automatic Attendance System
- `POST /api/v1/meeting/attendance/join` — called when user joins meeting room
- `POST /api/v1/meeting/attendance/leave` — called on leave/unmount
- Records: `userId`, `meetingId`, `joinTime`, `leaveTime`, `durationMinutes`
- Instructors can view per-meeting attendance via `GET /api/v1/meeting/:meetingId/attendance`

### 5. Summary Generation (Updated)
- Summaries now stored in MongoDB via `MeetingSummary` model
- PDF files still served statically from `public/summaries/`
- `GET /api/v1/summary` returns all summaries for authenticated user

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- GetStream account
- Cloudinary account
- Stripe account (for payments)

### Backend Setup

```bash
cd unified-platform/server
npm install
```

Edit `.env` with your credentials:
```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret_key

# Cloudinary
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
CLOUD_NAME=your_cloud_name

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
WEBHOOK_ENDPOINT_SECRET=whsec_...

# GetStream (keep existing keys)
STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev   # starts on port 8080
```

### Frontend Setup

```bash
cd unified-platform/client
npm install
npm run dev   # starts on port 5173
```

The Vite dev server proxies `/api` and `/summaries` to the backend automatically.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/user/register` | — | Register new user |
| POST | `/api/v1/user/login` | — | Login, sets JWT cookie |
| GET | `/api/v1/user/logout` | — | Clear cookie |
| GET | `/api/v1/user/profile` | ✅ | Get current user |
| PUT | `/api/v1/user/profile/update` | ✅ | Update name/photo |

### Meetings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/meeting/stream-token` | ✅ | Get Stream SDK token |
| POST | `/api/v1/meeting` | ✅ | Create meeting record |
| GET | `/api/v1/meeting/upcoming` | ✅ | Upcoming meetings |
| GET | `/api/v1/meeting/previous` | ✅ | Past meetings |
| PATCH | `/api/v1/meeting/:id/status` | ✅ | Update status |

### Attendance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/meeting/attendance/join` | ✅ | Record join |
| POST | `/api/v1/meeting/attendance/leave` | ✅ | Record leave |
| GET | `/api/v1/meeting/attendance/my` | ✅ | My history |
| GET | `/api/v1/meeting/:id/attendance` | ✅ | Meeting participants |

### Summaries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/summary/generate` | ✅ | Generate PDF summary |
| GET | `/api/v1/summary` | ✅ | List all summaries |
| GET | `/api/v1/summary/:meetingId` | ✅ | Get specific summary |

### Courses (LMS — unchanged)
All existing LMS course, lecture, progress, and purchase routes are preserved at `/api/v1/course`, `/api/v1/progress`, and `/api/v1/purchase`.

---

## Environment Variables Reference

| Variable | Service | Required |
|----------|---------|----------|
| `MONGO_URI` | MongoDB | ✅ |
| `SECRET_KEY` | JWT | ✅ |
| `STREAM_API_KEY` | GetStream | ✅ |
| `STREAM_SECRET_KEY` | GetStream | ✅ |
| `API_KEY`, `API_SECRET`, `CLOUD_NAME` | Cloudinary | ✅ |
| `STRIPE_SECRET_KEY` | Stripe | Optional |
| `FRONTEND_URL` | CORS | ✅ |
