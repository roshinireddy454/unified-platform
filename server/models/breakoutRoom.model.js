import mongoose from "mongoose";

const breakoutParticipantSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:     { type: String },
  photoUrl: { type: String, default: "" },
  joinedAt: { type: Date },
}, { _id: false });

const breakoutRoomSchema = new mongoose.Schema(
  {
    // Parent meeting this session belongs to
    meetingId: { type: String, required: true, index: true },

    // Each room gets a stable Stream call ID: `${meetingId}_br_${roomNumber}`
    rooms: [
      {
        roomIndex:    { type: Number, required: true },       // 1-based
        name:         { type: String, default: "" },          // e.g. "Group 1"
        streamCallId: { type: String, required: true },       // Stream call id
        participants: [breakoutParticipantSchema],
      },
    ],

    durationMinutes: { type: Number, default: 0 },           // 0 = no limit
    startedAt:       { type: Date },
    endsAt:          { type: Date },                         // startedAt + duration
    closedAt:        { type: Date },

    status: {
      type:    String,
      enum:    ["pending", "active", "closed"],
      default: "pending",
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const BreakoutRoom = mongoose.model("BreakoutRoom", breakoutRoomSchema);