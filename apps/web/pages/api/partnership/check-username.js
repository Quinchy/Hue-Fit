import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    // Find user with role "VENDOR" and username match (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
        Role: {
          name: "VENDOR",
        },
      },
    });

    if (user) {
      return res.status(200).json({ available: false, message: "Username is already taken." });
    }

    return res.status(200).json({ available: true, message: "Username is available." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
}