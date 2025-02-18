// File: pages/api/dashboard/get-admin-infos.js
import prisma from "@/utils/helpers";
import { getSession } from "next-auth/react";

/**
 * Return data for the admin's dashboard:
 * 1) allShopsCount: total number of ACTIVE shops
 * 2) allShopRequestsCount: total number of partnership requests with status = "PENDING"
 * 3) usersPerMonth: array of { month, count } for newly created users in the last year
 * 4) notifications: all notifications with userId = null and shopId = null (admin-level, take 7)
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Count only ACTIVE shops
    const allShopsCount = await prisma.shop.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Count only partnership requests that are PENDING
    const allShopRequestsCount = await prisma.partnershipRequest.count({
      where: {
        status: "PENDING",
      },
    });

    // For bar chart: new users per month in the last year
    const currentYear = new Date().getFullYear();
    const earliestDate = new Date(currentYear - 1, 0, 1); // last year January 1

    const groupedUsers = await prisma.user.groupBy({
      by: ["created_at"],
      where: {
        created_at: {
          gte: earliestDate,
        },
      },
      _count: { id: true },
      orderBy: {
        created_at: "asc",
      },
    });

    const monthsMap = {}; // e.g. { "2023-7": 5, "2023-8": 8, ... }
    groupedUsers.forEach((group) => {
      const dateObj = new Date(group.created_at);
      const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
      monthsMap[monthKey] = (monthsMap[monthKey] || 0) + group._count.id;
    });

    // Generate array for last 12 months
    const usersPerMonth = [];
    const now = new Date();
    const startYear = earliestDate.getFullYear();
    const startMonth = earliestDate.getMonth();

    let curYear = startYear;
    let curMonth = startMonth;
    while (
      curYear < now.getFullYear() ||
      (curYear === now.getFullYear() && curMonth <= now.getMonth())
    ) {
      const dateKey = `${curYear}-${curMonth}`;
      const dt = new Date(curYear, curMonth, 1);
      const monthName = dt.toLocaleString("default", { month: "long" });
      usersPerMonth.push({
        month: monthName,
        count: monthsMap[dateKey] || 0,
      });
      curMonth++;
      if (curMonth > 11) {
        curMonth = 0;
        curYear++;
      }
    }

    // Admin notifications: userId = null, shopId = null, take 7
    const notifications = await prisma.notification.findMany({
      where: {
        userId: null,
        shopId: null,
      },
      orderBy: { created_at: "desc" },
      take: 7,
    });

    res.status(200).json({
      allShopsCount,
      allShopRequestsCount,
      usersPerMonth,
      notifications,
      showAdminWelcome: false,
    });
  } catch (error) {
    console.error("Error on get-admin-infos:", error);
    res.status(500).json({ error: "Server error" });
  }
}
