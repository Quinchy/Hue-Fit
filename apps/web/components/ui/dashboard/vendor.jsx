// File: "@/components/ui/dashboard/vendor.js"
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { Shirt, Tag, Store, TrendingUp, BellRing } from 'lucide-react';
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function VendorDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map product type names to specific hex colors matching your Tailwind classes.
  const typeColorMapping = {
    UPPERWEAR: "#3b82f6", // bg-blue-500
    LOWERWEAR: "#14b8a6", // bg-teal-500
    FOOTWEAR: "#8b5cf6",  // bg-purple-500
    OUTERWEAR: "#06b6d4", // bg-cyan-500
  };

  // Build chart data dynamically from dashboardData.typeCounts.
  const chartData = useMemo(
    () =>
      dashboardData && dashboardData.typeCounts
        ? dashboardData.typeCounts.map((type) => {
            const fillColor =
              typeColorMapping[type.typeName.toUpperCase()] || "#facc15"; // fallback color if not mapped
            return {
              browser: type.typeName,
              visitors: type.count,
              fill: fillColor,
            };
          })
        : [],
    [dashboardData, typeColorMapping]
  );

  // Minimal chart config that maps the count to a label.
  const chartConfig = {
    visitors: { label: "Count" },
  };

  useEffect(() => {
    if (!session?.user?.shopId) return;

    const fetchDashboardData = async () => {
      try {
        const res = await fetch(
          `/api/dashboard/get-vendor-infos?shopId=${session.user.shopId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard information");
        }
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  return (
    <DashboardLayoutWrapper>
      <p className="uppercase">
        {session?.user?.firstName ? (
          <div className="flex items-center gap-2">
            <p className="font-medium text-[2.50rem] leading-[2.5rem] tracking-tight">
              {"Welcome, "}
            </p>
            <CardTitle className="text-[2.35rem] leading-[2.5rem] tracking-widest">
              {session.user.firstName}
            </CardTitle>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-medium text-[2.50rem] leading-[2.5rem] tracking-tight">
              {"Welcome, "}
            </p>
            <CardTitle className="text-[2.35rem] leading-[2.5rem] tracking-widest">
              {"User"}
            </CardTitle>
          </div>
        )}
      </p>
      <div className="flex flex-col gap-4"> 
        {loading && <p>Loading dashboard information...</p>}
        {error && <p>Error: {error}</p>}
        {dashboardData && (
          <>
            <div className="flex flex-row gap-4 h-[47rem]">     
              <div className="flex flex-col gap-4 w-full h-full">
                <div className="flex flex-row gap-4">
                  <Card className="w-full flex flex-col justify-center p-6">
                    <Shirt width={30} height={30} className="mb-2 stroke-2" />
                    <div className="flex flex-col">
                      <Label className="uppercase font-medium">{"Products"}</Label>
                      <p className="text-6xl font-bold">{dashboardData.productCount}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <p className="uppercase font-extralight text-base">{"Total of"}</p>
                      <p className="text-base font-bold">{dashboardData.productVariantCount}</p>
                      <Label className="uppercase font-extralight text-base">{"Product Items"}</Label>
                    </div>
                  </Card>
                  <Card className="w-full flex flex-col justify-center p-6">
                    <Tag width={30} height={30} className="mb-2 stroke-2" />
                    <div className="flex flex-col">
                      <Label className="uppercase font-medium">{"Orders"}</Label>
                      <p className="text-6xl font-bold">{dashboardData.orderCount}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <p className="uppercase font-extralight text-base">{"Total of"}</p>
                      <p className="text-base font-bold">{dashboardData.orderItemCount}</p>
                      <Label className="uppercase font-extralight text-base">{"Order Items"}</Label>
                    </div>
                  </Card>
                </div>
                <Card className="flex flex-col items-start h-full p-3">
                  <CardHeader className="items-start pb-0">
                    <Label className="uppercase font-medium">{"PRODUCT TYPE"}</Label>
                    <div className="leading-none text-muted-foreground">
                      {"Showing all product types that are available in your shop."}
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
              <Card className="w-full h-full p-5">
                <div className="flex flex-row items-center gap-2 mb-3">
                  <BellRing />
                  <Label className="uppercase font-medium text-lg">Notifications:</Label>
                </div>
                {dashboardData.notifications.length ? (
                  dashboardData.notifications.map((notification) => (
                    <div key={notification.id} className="flex flex-col gap-1 p-2 border-l-4 bg-muted rounded-lg rounded-ss-none rounded-es-none">
                      <div className="flex flex-col items-start gap-0 ml-1">
                        <p className="text-base uppercase font-bold">{notification.title}</p>
                        <p className="text-base font-extralight">{notification.message}</p>
                      </div>
                      <p className="font-thin text-sm text-primary/50 text-end">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-lg text-center font-extralight text-primary/50">No notifications</p>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayoutWrapper>
  );
}
