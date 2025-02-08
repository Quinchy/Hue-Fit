// pages/api/forgot-password/create-password.js
import bcrypt from "bcrypt";
import prisma, { disconnectPrisma } from "@/utils/helpers";
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, email, otp, newPassword, confirmPassword } = req.body;

  if (!username || !email || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  // Check that the OTP cookie exists
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  if (!cookies.otp) {
    return res.status(400).json({ error: "OTP expired or missing." });
  }

  // Compare the provided OTP with the one in the cookie
  if (otp !== cookies.otp) {
    return res.status(400).json({ error: "Invalid OTP." });
  }

  try {
    // Find vendor user using compound unique key (username, roleId: 2)
    const user = await prisma.user.findUnique({
      where: { username_roleId: { username, roleId: 2 } },
      include: { VendorProfile: true },
    });

    if (!user || !user.VendorProfile) {
      return res.status(404).json({ error: "User not found or not a vendor." });
    }

    // Verify that the email on file matches the provided email
    if (user.VendorProfile.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ error: "Email does not match the user." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Clear the OTP cookie
    res.setHeader("Set-Cookie", cookie.serialize("otp", "", {
      maxAge: -1,
      path: "/",
    }));

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password." });
  } finally {
    await disconnectPrisma();
  }
}
