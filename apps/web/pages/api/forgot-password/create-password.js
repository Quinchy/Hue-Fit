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

  // Check if the request is from mobile by inspecting a custom header.
  const isMobile = req.headers["x-platform"] === "mobile";

  if (!isMobile) {
    // For web requests, check that the OTP cookie exists.
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    if (!cookies.otp) {
      return res.status(400).json({ error: "OTP expired or missing." });
    }

    // Compare the provided OTP with the one in the cookie.
    if (otp !== cookies.otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }
  }
  // If mobile, skip OTP cookie verification.

  try {
    // Determine which role/profile to use:
    // - For mobile, use Customer (roleId: 3, CustomerProfile)
    // - Otherwise, use Vendor (roleId: 2, VendorProfile)
    const roleId = isMobile ? 3 : 2;
    const profileKey = isMobile ? "CustomerProfile" : "VendorProfile";

    // Find user using compound unique key.
    const user = await prisma.user.findUnique({
      where: { username_roleId: { username, roleId } },
      include: { [profileKey]: true },
    });

    if (!user || !user[profileKey]) {
      return res.status(404).json({ error: "User not found or profile missing." });
    }

    // Verify that the email on file matches the provided email.
    if (user[profileKey].email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ error: "Email does not match the user." });
    }

    // Hash the new password.
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password.
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // For web, clear the OTP cookie.
    if (!isMobile) {
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("otp", "", {
          maxAge: -1,
          path: "/",
        })
      );
    }

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password." });
  } finally {
    await disconnectPrisma();
  }
}
