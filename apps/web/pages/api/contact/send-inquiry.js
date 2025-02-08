// File: pages/api/contact/send-inquiry.js
import prisma from "@/utils/helpers";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const { email, subject, message } = req.body;
    
    if (!email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // 1) Create the Inquiry
    const inquiry = await prisma.inquiryMessage.create({
      data: {
        inquiryNo: uuidv4(),
        email,
        subject,
        message,
      },
    });
    
    // 2) Create the Notification
    await prisma.notification.create({
      data: {
        title: "Inquiry Received",
        message: `You have an inquiry about "${subject}" from ${email}.`,
      },
    });
    
    // Respond with the newly created inquiry
    return res.status(200).json(inquiry);
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
