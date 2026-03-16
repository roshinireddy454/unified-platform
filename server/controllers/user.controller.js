import { User } from "../models/user.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Course } from "../models/course.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "User already exists with this email." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const validRole = ["instructor", "student"].includes(role) ? role : "student";
    await User.create({ name, email, password: hashedPassword, role: validRole });
    return res.status(201).json({ success: true, message: "Account created successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to register" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Incorrect email or password" });
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(400).json({ success: false, message: "Incorrect email or password" });
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

export const logout = async (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({ message: "Logged out successfully.", success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to logout" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password").populate("enrolledCourses");
    if (!user) return res.status(404).json({ message: "Profile not found", success: false });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load user" });
  }
};

// ─── KEY FIX: Dedicated enrolled courses endpoint ─────────────
// Sources from BOTH user.enrolledCourses AND completed CoursePurchase records.
// This catches the common case where webhook never fired (local dev / missed event)
// and syncs them automatically.
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.id;

    // 1. Collect course IDs from user.enrolledCourses
    const user = await User.findById(userId).select("enrolledCourses");
    const enrolledSet = new Set(
      (user?.enrolledCourses || []).map((id) => id.toString())
    );

    // 2. Also collect from completed CoursePurchase records
    const completedPurchases = await CoursePurchase.find({
      userId,
      status: "completed",
    }).select("courseId");

    const purchasedIds = completedPurchases.map((p) => p.courseId.toString());

    // 3. Sync any purchased course that's missing from enrolledCourses
    const toSync = purchasedIds.filter((id) => !enrolledSet.has(id));
    if (toSync.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: { $each: toSync } },
      });
      await Course.updateMany(
        { _id: { $in: toSync } },
        { $addToSet: { enrolledStudents: userId } }
      );
      toSync.forEach((id) => enrolledSet.add(id));
      console.log(`✅ Synced ${toSync.length} course(s) to enrolledCourses for user ${userId}`);
    }

    const allIds = [...enrolledSet];
    if (allIds.length === 0) {
      return res.status(200).json({ success: true, courses: [] });
    }

    // 4. Fetch full course details with lectures populated (needed for progress %)
    const courses = await Course.find({ _id: { $in: allIds } })
      .populate({ path: "creator", select: "name photoUrl" })
      .populate({ path: "lectures", select: "_id lectureTitle" })
      .lean();

    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("getEnrolledCourses error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch enrolled courses" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const profilePhoto = req.file;
    const user = await User.findById(req.id);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    let photoUrl = user.photoUrl;
    if (profilePhoto) {
      if (user.photoUrl) {
        const publicId = user.photoUrl.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const cloudResponse = await uploadMedia(profilePhoto.path);
      photoUrl = cloudResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.id, { name, photoUrl }, { new: true }
    ).select("-password");
    return res.status(200).json({ success: true, user: updatedUser, message: "Profile updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};