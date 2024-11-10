import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { requestNo } = req.query;

  if (!requestNo) {
    return res.status(400).json({ message: 'Request number is required' });
  }

  try {
    const request = await prisma.partnershipRequests.findUnique({
      where: { requestNo },
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching shop request:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
