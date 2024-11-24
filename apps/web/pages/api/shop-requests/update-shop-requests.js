import prisma from "@/utils/helpers";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { requestNo, status, email, message } = req.body;

  // Map "ACCEPTED" status to "ACTIVE" for database operations
  if (status === "ACCEPTED") {
    status = "ACTIVE";
  }

  // Validate status
  if (!["PENDING", "REJECTED", "ACTIVE"].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Find the partnership request by requestNo
    const partnershipRequest = await prisma.partnershipRequests.findUnique({
      where: { requestNo },
      select: {
        userId: true,
        shopId: true,
        status: true,
      },
    });

    if (!partnershipRequest) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    // Run the update operations in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: partnershipRequest.userId },
        data: { status },
      });

      await tx.shops.update({
        where: { id: partnershipRequest.shopId },
        data: { status },
      });

      await tx.partnershipRequests.update({
        where: { requestNo },
        data: { status },
      });
    });

    // Prepare the default message if not provided
    let defaultMessage;
    if (status === "ACTIVE") {
      defaultMessage = `Congratulations! Your partnership request has been approved, and your vendor account has been activated. You can now access the vendor dashboard by logging in at https://hue-fit-web.vercel.app/account/login.`;
    } else if (status === "REJECTED") {
      defaultMessage = `We regret to inform you that your partnership request has not been approved. Thank you for your interest in HueFit.`;
    }

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOREPLY_EMAIL,
        pass: process.env.NOREPLY_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"HueFit" <${process.env.NOREPLY_EMAIL}>`,
      to: email,
      subject: `Partnership Request Update - ${status}`,
      text: message || defaultMessage,
    });

    res.status(200).json({ message: 'Request status successfully updated and email sent' });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while updating the request status',
      details: error.message,
    });
  }
}
