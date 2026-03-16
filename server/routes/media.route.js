import express from "express";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

router.post("/upload-video", upload.single("file"), async (req, res) => {
  try {
    const result = await uploadMedia(req.file.path);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: "Video upload failed" });
  }
});

export default router;
