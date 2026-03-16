import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getMyNotifications,
  markOneRead,
  markAllRead,
  deleteOne,
  clearAll,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/",                     isAuthenticated, getMyNotifications);
router.patch("/read-all",           isAuthenticated, markAllRead);
router.patch("/:id/read",           isAuthenticated, markOneRead);
router.delete("/",                  isAuthenticated, clearAll);
router.delete("/:id",               isAuthenticated, deleteOne);

export default router;