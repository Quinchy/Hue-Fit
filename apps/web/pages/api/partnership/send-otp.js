import nodemailer from "nodemailer";
import cookie from "cookie";

// Generate a random OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Generate OTP
    const otp = generateOtp();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOREPLY_EMAIL,
        pass: process.env.NOREPLY_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `"HueFit" <${process.env.NOREPLY_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
      html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It is valid for 5 minutes.</p>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Store OTP in a cookie with a 5-minute expiration
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("otp", otp, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 5 * 60, // 5 minutes
        path: "/",
      })
    );

    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
}
