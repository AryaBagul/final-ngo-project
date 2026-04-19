const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"NGO Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

// ✅ ADD THIS FUNCTION (for first message notification)
const sendConnectionEmail = async (to, senderNgoName) => {
  const subject = "New NGO wants to connect with you";
  const text = `${senderNgoName} wants to connect with you on NGO Connect. Login to your dashboard to start chatting.`;

  await sendEmail(to, subject, text);
};

module.exports = { sendEmail, sendConnectionEmail };