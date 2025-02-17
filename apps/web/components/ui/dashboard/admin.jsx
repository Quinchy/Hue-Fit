// File: components/AdminDashboard.jsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, Store, Building2, User, CircleUserRound } from "lucide-react";
import routes from "@/routes";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";

/**
 * 1. SWR fetcher
 */
const fetcher = (url) => fetch(url).then((res) => res.json());

/**
 * 2. Helper to format date string to something like "Last XX days ago"
 */
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const seconds = diff / 1000;
  if (seconds < 60) return "Just Now";
  const minutes = seconds / 60;
  if (minutes < 60) {
    const m = Math.floor(minutes);
    return `Last ${m} minute${m > 1 ? "s" : ""} ago`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    const h = Math.floor(hours);
    return `Last ${h} hour${h > 1 ? "s" : ""} ago`;
  }
  const days = hours / 24;
  if (days < 7) {
    const d = Math.floor(days);
    return `Last ${d} day${d > 1 ? "s" : ""} ago`;
  }
  const weeks = days / 7;
  if (days < 365) {
    const w = Math.floor(weeks);
    return `Last ${w} week${w > 1 ? "s" : ""} ago`;
  }
  const years = days / 365;
  const y = Math.floor(years);
  return `Last ${y} year${y > 1 ? "s" : ""} ago`;
}

/**
 * 3. AdminDashboard Component
 */
export default function AdminDashboard() {
  const { data: session } = useSession();
  // Only fetch if we have an admin session
  const { data, error } = useSWR(session ? "/api/dashboard/get-admin-infos" : null, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const isLoading = !data && !error;
  const notifications = data?.notifications || [];

  // The user bar chart data for "number of new users created per month"
  // data?.usersPerMonth might look like: [{ month: "January", count: 10 }, ... ]
  const barChartData = data?.usersPerMonth || [];

  // Recharts config
  const chartConfig = { count: { label: "Count", color: "hsl(var(--chart-1))" } };

  /**
   * If you want a "welcome" dialog or something similar for admins, show it on mount
   */
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  useEffect(() => {
    // Example condition to show a one-time dialog
    if (data && data.showAdminWelcome) {
      setShowWelcomeDialog(true);
    }
  }, [data]);

  const handleDismissDialog = () => {
    setShowWelcomeDialog(false);
  };

  return (
    <DashboardLayoutWrapper>
      {showWelcomeDialog && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              handleDismissDialog();
            }
          }}
        >
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 uppercase mb-5">
                <Building2 className="stroke-[2px] mr-2" />
                Admin Dashboard
              </DialogTitle>
              <DialogDescription className="text-base font-thin italic">
                This is your admin control center, where you can manage shops, shop requests, 
                and more. Happy overseeing!
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={handleDismissDialog}
              className="mt-4 px-4 py-2 bg-primary text-pure font-semibold rounded hover:bg-primary/70 duration-500 ease-in-out"
            >
              Got it!
            </button>
          </DialogContent>
        </Dialog>
      )}

      {isLoading ? (
        <Skeleton className="w-full h-full" />
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <>
          <div className="flex items-center gap-2 uppercase">
            <p className="font-medium text-[2.50rem] leading-[2.5rem] tracking-tight">
            {"Welcome, "}
            </p>
            <CardTitle className="text-[2.35rem] leading-[2.5rem] tracking-widest">
              {session?.user?.firstName || "Admin"}
            </CardTitle>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 h-[47rem]">
              {/* Left Column */}
              <div className="flex flex-col gap-4 w-full h-full">
                {/* Stats Row */}
                <div className="flex flex-row gap-4">
                  <Card className="w-full flex flex-col justify-center p-6">
                    <Store width={30} height={30} className="mb-2 stroke-2" />
                    <div className="flex flex-col">
                      <Label className="uppercase font-medium">All Shops</Label>
                      <p className="text-6xl font-bold">{data.allShopsCount}</p>
                    </div>
                  </Card>
                  <Card className="w-full flex flex-col justify-center p-6">
                    <User width={30} height={30} className="mb-2 stroke-2" />
                    <div className="flex flex-col">
                      <Label className="uppercase font-medium">Shop Requests</Label>
                      <p className="text-6xl font-bold">{data.allShopRequestsCount}</p>
                    </div>
                  </Card>
                </div>

                {/* Bar Chart */}
                <Card className="flex flex-col items-start h-full p-3">
                  <CardHeader className="items-start pb-0">
                    <div className="flex flex-row items-center gap-2">
                      <CircleUserRound className="w-5" />
                      <Label className="uppercase font-medium">Number of new users per month</Label>
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Displays the count of newly registered users each month.
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 mt-5 w-full">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <BarChart data={barChartData} width={500} height={300}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <ChartTooltip
                          cursor={{ fill: "transparent" }}
                          content={<ChartTooltipContent />}
                        />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Notifications */}
              <Card className="w-full h-full p-5">
                <div className="flex flex-row items-center justify-between gap-4 mb-4">                    
                  <div className="flex flex-row items-center gap-2">
                    <BellRing className="w-5" />
                    <Label className="uppercase font-medium">Notifications:</Label>
                  </div>
                  <Link href={routes.notification} className="text-primary/50 text-base uppercase font-light hover:underline">
                    See all
                  </Link>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[660px]">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex flex-col p-2 border-l-4 bg-muted rounded-lg rounded-ss-none mr-2 rounded-es-none"
                      >
                        <div className="flex flex-col items-start gap-2 ml-1">
                          <p className="text-base uppercase font-bold">{notification.title}</p>
                          <p className="text-base font-extralight">{notification.message}</p>
                        </div>
                        <p className="font-thin text-sm text-primary/50 text-end">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-lg text-center font-extralight text-primary/45 mt-[20rem]">
                      You have no notifications.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </DashboardLayoutWrapper>
  );
}
