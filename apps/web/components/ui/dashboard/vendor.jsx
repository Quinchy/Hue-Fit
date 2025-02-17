import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { Shirt, Tag, BellRing, Store, CreditCard, PackageSearch } from "lucide-react";
import routes from "@/routes";
import Link from "next/link";
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
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
          <div className="flex flex-row gap-4 min-h-[49rem]">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-row gap-4">
                <Card className="w-full flex flex-col justify-center p-6">
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center gap-2 mb-2">
                      <Shirt width={20} height={20} className="stroke-2" />
                      <Label className="uppercase font-medium">Products</Label>
                    </div>
                    <p className="text-6xl font-bold">
                      {dashboardData.productCount || 0}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <p className="uppercase font-extralight text-base text-primary/75">
                      Total of{" "}
                    </p>
                    <p className="text-base font-bold uppercase">
                      {dashboardData.productVariantCount || 0}
                    </p>
                    <Label className="uppercase font-extralight text-base text-primary/75">
                      Product Items
                    </Label>
                  </div>
                </Card>
                <Card className="w-full flex flex-col justify-center p-6">
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center gap-2 mb-2">
                      <Tag width={20} height={20} className="stroke-2" />
                      <Label className="uppercase font-medium">Orders</Label>
                    </div>
                    <p className="text-6xl font-bold">
                      {dashboardData.orderCount || 0}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <p className="uppercase font-extralight text-base text-primary/75">
                      Total of{" "}
                    </p>
                    <p className="text-base font-bold">
                      {dashboardData.orderItemCount || 0}
                    </p>
                    <Label className="uppercase font-extralight text-base text-primary/75">
                      Order Items
                    </Label>
                  </div>
                </Card>
              </div>
              <Card className="flex flex-col p-5 h-full">
                <CardHeader className="flex flex-col p-0 pb-5">
                  <div className="flex flex-row items-center gap-2">
                    <PackageSearch className="w-5" />
                    <Label className="uppercase font-medium">Product Types</Label>
                  </div>
                  <div className="font-extralight text-base text-primary/75 leading-none">
                    Showing all product types available in your shop.
                  </div>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <p className="text-center text-lg font-extralight text-primary/45 mt-[13rem]">
                      {"You haven't created any products yet."}
                    </p>
                  ) : (
                    <ChartContainer config={chartConfig} className="w-full h-fit-content">
                      <PieChart width="100%" height="100%">
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="visitors" nameKey="browser" innerRadius={110} />
                      </PieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <Card className="flex flex-col w-full p-5 h-full">
                <CardHeader className="flex flex-col p-0 pb-5">
                  <div className="flex flex-row items-center gap-2">
                    <CreditCard className="w-5" />
                    <Label className="uppercase font-medium">Payments</Label>
                  </div>
                  <div className="font-extralight text-base text-primary/75 leading-none">
                    Total payments per month
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardData.paymentChartData && dashboardData.paymentChartData.length > 0 ? (
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
                        <Bar dataKey="total" radius={4}>
                          {dashboardData.paymentChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={['#3b82f6', '#14b8a6', '#8b5cf6', '#06b6d4'][index % 4]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-center text-lg font-extralight text-primary/45 mt-[8rem]">
                      You have no payments made yet.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="flex flex-col w-full p-5 h-full">
                <div className="flex flex-row items-center justify-between gap-4 mb-4">                    
                  <div className="flex flex-row items-center gap-2">
                    <BellRing className="w-5" />
                    <Label className="uppercase font-medium">Notifications:</Label>
                  </div>
                  <Link href={routes.notification} className="text-primary/50 text-base uppercase font-light hover:underline">
                    See all
                  </Link>
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
                    <p className="text-center text-lg font-extralight text-primary/45 mt-[8rem]">
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
