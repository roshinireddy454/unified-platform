import Stripe from "stripe";
import { Course }         from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture }        from "../models/lecture.model.js";
import { User }           from "../models/user.model.js";
import { notify }         from "../utils/notify.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: course.courseTitle, images: [course.courseThumbnail] },
            unit_amount: course.coursePrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.FRONTEND_URL}/courses/${courseId}`,
      metadata: { courseId, userId },
      shipping_address_collection: { allowed_countries: ["IN"] },
    });

    if (!session.url) return res.status(400).json({ success: false, message: "Error while creating session" });

    newPurchase.paymentId = session.id;
    await newPurchase.save();
    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
};

// ─── Internal helper so both verifyPayment & webhook share enrollment logic ───
async function enrollStudent(purchase, io) {
  const course = purchase.courseId; // already populated

  // Unlock all lectures
  if (course?.lectures?.length > 0) {
    await Lecture.updateMany(
      { _id: { $in: course.lectures } },
      { $set: { isPreviewFree: true } }
    );
  }

  await User.findByIdAndUpdate(
    purchase.userId,
    { $addToSet: { enrolledCourses: course._id } },
    { new: true }
  );
  await Course.findByIdAndUpdate(
    course._id,
    { $addToSet: { enrolledStudents: purchase.userId } },
    { new: true }
  );

  // ── Notifications ──────────────────────────────────────────
  // 1. Student: payment succeeded
  // 2. Student: course added to My Courses
  // 3. Instructor: new student enrolled
  await notify(io, [
    {
      recipient: purchase.userId,
      type:      "payment_success",
      title:     "Payment Successful 🎉",
      message:   `Your payment for "${course.courseTitle}" was successful.`,
      link:      `/course-progress/${course._id}`,
      metadata:  { courseId: course._id },
    },
    {
      recipient: purchase.userId,
      type:      "course_enrolled",
      title:     "Course Added to My Courses",
      message:   `"${course.courseTitle}" is now available in your My Courses section.`,
      link:      `/course-progress/${course._id}`,
      metadata:  { courseId: course._id },
    },
    {
      recipient: course.creator,
      type:      "student_enrolled",
      title:     "New Student Enrolled",
      message:   `A new student has enrolled in your course "${course.courseTitle}".`,
      link:      `/enrolled-students`,
      metadata:  { courseId: course._id },
    },
  ]);
}

// ─── Called by frontend on success_url redirect ───────────────
export const verifyPaymentAndEnroll = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.id;

    if (!sessionId) return res.status(400).json({ success: false, message: "Session ID required" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    const purchase = await CoursePurchase.findOne({ paymentId: sessionId }).populate("courseId");
    if (!purchase) return res.status(404).json({ success: false, message: "Purchase record not found" });

    if (purchase.status !== "completed") {
      purchase.status = "completed";
      if (session.amount_total) purchase.amount = session.amount_total / 100;
      await purchase.save();
      await enrollStudent(purchase, req.io);
    }

    return res.status(200).json({
      success:  true,
      courseId: purchase.courseId._id,
      message:  "Enrollment confirmed",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;
  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;
    const header = stripe.webhooks.generateTestHeaderString({ payload: payloadString, secret });
    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session  = event.data.object;
      const purchase = await CoursePurchase.findOne({ paymentId: session.id }).populate({ path: "courseId" });
      if (!purchase) return res.status(404).json({ message: "Purchase not found" });

      if (purchase.status !== "completed") {
        if (session.amount_total) purchase.amount = session.amount_total / 100;
        purchase.status = "completed";
        await purchase.save();
        await enrollStudent(purchase, null); // no io in webhook context
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    const course = await Course.findById(courseId).populate({ path: "creator" }).populate({ path: "lectures" });
    if (!course) return res.status(404).json({ message: "course not found!" });

    const purchase        = await CoursePurchase.findOne({ userId, courseId, status: "completed" });
    const user            = await User.findById(userId).select("enrolledCourses");
    const enrolledDirectly = user?.enrolledCourses?.some((id) => id.toString() === courseId.toString());
    const purchased        = !!purchase || enrolledDirectly;

    return res.status(200).json({ course, purchased });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to get course details" });
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({ status: "completed" }).populate("courseId");
    return res.status(200).json({ purchasedCourse: purchasedCourse || [] });
  } catch (error) {
    console.log(error);
  }
};