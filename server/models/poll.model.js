import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
  text:    { type: String, required: true },
  voters:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // who voted for this
}, { _id: true });

const pollSchema = new mongoose.Schema(
  {
    meetingId:  { type: String, required: true, index: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question:   { type: String, required: true },
    options:    { type: [pollOptionSchema], required: true },
    status:     { type: String, enum: ["active", "closed"], default: "active" },
    closedAt:   { type: Date },
  },
  { timestamps: true }
);

export const Poll = mongoose.model("Poll", pollSchema);