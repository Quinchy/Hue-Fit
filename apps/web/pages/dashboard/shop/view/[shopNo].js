import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import routes from "@/routes";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import MapView from "@/components/ui/map-view";
import BusinessLicense from "@/components/ui/business-license";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewShop() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { shopNo } = router.query;

  useEffect(() => {
    if (shopNo) {
      const fetchShopData = async () => {
        try {
          const response = await fetch(`/api/shops/get-shop-details?shopNo=${shopNo}`);
          const data = await response.json();
          setShop(data);
        } catch (error) {
          console.error("Error fetching shop data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchShopData();
    }
  }, [shopNo]);

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col gap-10">
        <div className="flex flex-row justify-between">
          <CardTitle className="text-4xl font-bold">Shop Information</CardTitle>
          <Button variant="outline" onClick={() => router.push(routes.shop)}>
            <MoveLeft className="scale-125" />
            Back to Shops
          </Button>
        </div>

        <div className="flex flex-row items-start gap-5">
          <div className="bg-accent rounded border-8 border-card">
            {loading ? (
              <Skeleton className="h-[320px] w-[320px] rounded" />
            ) : (
              <Image
                src={shop.logo || "/images/placeholder-picture.png"}
                alt="Profile"
                width={320}
                height={320}
                className="max-w-[30rem]"
              />
            )}
          </div>

          <Card className="w-full">
            <div className="flex flex-col gap-5">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-3 w-full">
                  <CardTitle className="text-2xl">Shop Information:</CardTitle>
                  <div className="flex flex-col">
                    {["shopNo", "name", "contactNo", "status"].map((field, index) => (
                      <div key={index} className="flex flex-row gap-3 items-center">
                        <Label className="font-bold">{field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</Label>
                        {loading ? <Skeleton className="h-3 w-48" /> : shop[field]}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <CardTitle className="text-2xl">Contact Person Information:</CardTitle>
                  <div className="flex flex-col">
                    {["firstName", "lastName", "contactNo", "email", "position"].map((field, index) => (
                      <div key={index} className="flex flex-row gap-3 items-center">
                        <Label className="font-bold">{field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</Label>
                        {loading ? <Skeleton className="h-3 w-48" /> : shop.contactPerson?.[field] || "N/A"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="font-bold">Description:</Label>
                {loading ? <Skeleton className="h-16 w-full" /> : <p>{shop.description || "No description available."}</p>}
              </div>
            </div>
          </Card>
        </div>

        <Card className="w-full">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-3 w-full">
              <CardTitle className="text-2xl">Shop Address Information:</CardTitle>
              <div className="flex flex-col">
                {["address", "googleMapPlaceName", "latitude", "longitude"].map((field, index) => (
                  <div key={index} className="flex flex-row gap-3 items-center">
                    <Label className="font-bold">{field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:</Label>
                    {loading ? <Skeleton className="h-3 w-48" /> : shop[field] || "N/A"}
                  </div>
                ))}
              </div>
              <div className="mt-1 flex flex-col gap-3 items-start">
                <Label className="font-bold">Business License:</Label>
                {loading ? (
                  <Skeleton className="h-44 w-11/12" />
                ) : (
                  shop.businessLicenses.map((license, index) => <BusinessLicense key={index} imageUrl={license} />)
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <CardTitle className="text-2xl">Location in Google Map:</CardTitle>
              {loading ? (
                <Skeleton className="h-[400px] w-full rounded" />
              ) : (
                <MapView latitude={shop.latitude} longitude={shop.longitude} />
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}
