import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: "OTP is required." });
  }

  // Parse the cookies to retrieve the OTP
  const cookies = cookie.parse(req.headers.cookie || "");
  const storedOtp = cookies.otp;

  if (!storedOtp) {
    return res.status(400).json({ error: "OTP has expired or is invalid." });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  // Clear the OTP cookie after successful verification
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("otp", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })
  );

  res.status(200).json({ success: true, message: "OTP verified successfully." });
}
