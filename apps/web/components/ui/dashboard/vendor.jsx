// File: components/VendorDashboard.jsx
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { Shirt, Tag, BellRing, Store } from "lucide-react";
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function VendorDashboard() {
  const { data: session } = useSession();
  const { data: dashboardData, error } = useSWR(
    session ? "/api/dashboard/get-vendor-infos" : null,
    fetcher,
    { refreshInterval: 5000, revalidateOnFocus: true }
  );
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  useEffect(() => {
    if (dashboardData && dashboardData.partnershipRequestIsSeen === false) {
      setShowWelcomeDialog(true);
    }
  }, [dashboardData]);

  const typeColorMapping = {
    UPPERWEAR: "#3b82f6",
    LOWERWEAR: "#14b8a6",
    FOOTWEAR: "#8b5cf6",
    OUTERWEAR: "#06b6d4",
  };

  const chartData = useMemo(
    () =>
      dashboardData && dashboardData.typeCounts
        ? dashboardData.typeCounts.map((type) => {
            const fillColor =
              typeColorMapping[type.typeName.toUpperCase()] || "#facc15";
            return {
              browser: type.typeName,
              visitors: type.count,
              fill: fillColor,
            };
          })
        : [],
    [dashboardData]
  );

  const chartConfig = {
    visitors: { label: "Count" },
  };

  // Using the same primary color as the pie chart slices.
  const paymentChartConfig = {
    total: {
      label: "Payments",
      color: "#3b82f6",
    },
  };

  const isLoading = !dashboardData && !error;

  const handleMarkSeen = async () => {
    try {
      await fetch("/api/partnership/mark-seen", { method: "POST" });
      setShowWelcomeDialog(false);
    } catch (err) {
      console.error("Error marking as seen:", err);
    }
  };

  return (
    <DashboardLayoutWrapper>
      {showWelcomeDialog && (
        <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              handleMarkSeen();
            }
          }}
        >
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 uppercase mb-5">
                <Store className="stroke-[2px] mr-2" /> Welcome to Your Shop Dashboard!
              </DialogTitle>
              <DialogDescription className="text-base font-thin italic">
                You can now start adding products, efficiently manage your orders, and customize your shop to maximize your business growth.
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={handleMarkSeen}
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
        <p>Error: {error.message}</p>
      ) : (
        <>
          <p className="uppercase">
            {session?.user?.firstName ? (
              <div className="flex items-center gap-2">
                <p className="font-medium text-[2.50rem] leading-[2.5rem] tracking-tight">
                  Welcome,{" "}
                </p>
                <CardTitle className="text-[2.35rem] leading-[2.5rem] tracking-widest">
                  {session.user.firstName}
                </CardTitle>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-[2.50rem] leading-[2.5rem] tracking-tight">
                  Welcome,{" "}
                </p>
                <CardTitle className="text-[2.35rem] leading-[2.5rem] tracking-widest">
                  User
                </CardTitle>
              </div>
            )}
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 h-[47rem]">
              <div className="flex flex-col gap-4 w-full h-full">
                <div className="flex flex-row gap-4">
                  <Card className="w-full flex flex-col justify-center p-6">
                    <Shirt width={30} height={30} className="mb-2 stroke-2" />
                    <div className="flex flex-col">
                      <Label className="uppercase font-medium">Products</Label>
                      <p className="text-6xl font-bold">{dashboardData.productCount}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <p className="uppercase font-extralight text-base">Total of</p>
                      <p className="text-base font-bold">{dashboardData.productVariantCount}</p>
                      <Label className="uppercase font-extralight text-base">Product Items</Label>
                    </div>
                  </Card>
                  <Card className="w-full flex flex-col justify-center p-6">
                    <Tag width={30} height={30} className="mb-2 stroke-2" />
                    <div className="flex flex-col">
                      <Label className="uppercase font-medium">Orders</Label>
                      <p className="text-6xl font-bold">{dashboardData.orderCount}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <p className="uppercase font-extralight text-base">Total of</p>
                      <p className="text-base font-bold">{dashboardData.orderItemCount}</p>
                      <Label className="uppercase font-extralight text-base">Order Items</Label>
                    </div>
                  </Card>
                </div>
                <Card className="flex flex-col items-start h-full p-3">
                  <CardHeader className="items-start pb-0">
                    <Label className="uppercase font-medium">PRODUCT TYPE</Label>
                    <div className="leading-none text-muted-foreground">
                      Showing all product types available in your shop.
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 w-full">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                      <PieChart width="100%" height="100%">
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={130} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <Card className="flex-[2] w-full h-1/2 p-5">
                  <CardHeader>
                    <Label className="uppercase font-medium">Payments</Label>
                    <div className="leading-none text-muted-foreground">Total payments per month</div>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={paymentChartConfig} className="w-full h-64">
                      <BarChart data={dashboardData.paymentChartData} width={400} height={250}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar dataKey="total" fill="#3b82f6" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                <Card className="flex-1 w-full h-1/2 p-5">
                  <div className="flex flex-row items-center gap-2 mb-3">
                    <BellRing />
                    <Label className="uppercase font-medium text-lg">Notifications:</Label>
                  </div>
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[275px]">
                    {dashboardData.notifications.length ? (
                      dashboardData.notifications.map((notification) => (
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
                      <p className="text-lg text-center font-extralight text-primary/50">
                        No notifications
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayoutWrapper>
  );
}
