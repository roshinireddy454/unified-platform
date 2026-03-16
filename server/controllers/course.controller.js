import { Course }   from "../models/course.model.js";
import { Lecture }  from "../models/lecture.model.js";
import { User }     from "../models/user.model.js";
import { notify }   from "../utils/notify.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) return res.status(400).json({ message: "Course title and category is required." });
    const course = await Course.create({ courseTitle, category, creator: req.id });
    return res.status(201).json({ course, message: "Course created." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to create course" });
  }
};

export const searchCourse = async (req, res) => {
  try {
    const { query = "", categories = [], sortByPrice = "" } = req.query;
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle:    { $regex: query, $options: "i" } },
        { category:    { $regex: query, $options: "i" } },
      ],
    };
    if (categories.length > 0) searchCriteria.category = { $in: categories };
    const sortOptions = {};
    if (sortByPrice === "low")  sortOptions.coursePrice = 1;
    else if (sortByPrice === "high") sortOptions.coursePrice = -1;
    const courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);
    return res.status(200).json({ success: true, courses: courses || [] });
  } catch (error) {
    console.log(error);
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" });
    if (!courses) return res.status(404).json({ message: "Course not found" });
    return res.status(200).json({ courses });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get published courses" });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ creator: req.id });
    return res.status(200).json({ courses: courses || [] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get courses" });
  }
};

export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
    const thumbnail = req.file;
    let course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      courseThumbnail = await uploadMedia(thumbnail.path);
    }
    const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url };
    course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
    return res.status(200).json({ course, message: "Course updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update course" });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });
    return res.status(200).json({ course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get course" });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;
    if (!lectureTitle || !courseId) return res.status(400).json({ message: "Lecture title is required" });
    const lecture = await Lecture.create({ lectureTitle });
    const course  = await Course.findById(courseId);
    if (course) { course.lectures.push(lecture._id); await course.save(); }
    return res.status(201).json({ lecture, message: "Lecture created successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create lecture" });
  }
};

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.status(200).json({ lectures: course.lectures });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get lectures" });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!" });
    if (lectureTitle)  lecture.lectureTitle = lectureTitle;
    if (videoInfo)     lecture.publicId     = videoInfo.publicId;
    if (videoInfo)     lecture.videoUrl     = videoInfo.videoUrl;
    if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree;
    await lecture.save();
    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(200).json({ lecture, message: "Lecture updated." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to edit lecture" });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!" });
    if (lecture.publicId) await deleteVideoFromCloudinary(lecture.publicId);
    await Lecture.findByIdAndDelete(lectureId);
    await Course.updateOne({ lectures: lectureId }, { $pull: { lectures: lectureId } });
    return res.status(200).json({ message: "Lecture removed successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove lecture" });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found!" });
    return res.status(200).json({ lecture });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get lecture" });
  }
};

// ─── Toggle publish — fires course_published notification to ALL students ────
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId }  = req.params;
    const { publish }   = req.query;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    const wasPublished = course.isPublished;
    course.isPublished = publish === "true";
    await course.save();

    // Only notify on first publish (not on unpublish)
    if (!wasPublished && course.isPublished) {
      // Get all students to notify them about the new course
      const students = await User.find({ role: "student" }).select("_id");
      if (students.length > 0) {
        await notify(
          req.io,
          students.map((s) => ({
            recipient: s._id,
            type:      "course_published",
            title:     "New Course Available 🎓",
            message:   `A new course "${course.courseTitle}" is now available. Check it out!`,
            link:      `/courses/${courseId}`,
            metadata:  { courseId },
          }))
        );
      }
    }

    return res.status(200).json({ message: `Course is ${course.isPublished ? "Published" : "Unpublished"}` });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update status" });
  }
};