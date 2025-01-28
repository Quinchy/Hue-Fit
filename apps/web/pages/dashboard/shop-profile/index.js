import React, { useEffect, useState } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

export default function ShopProfile() {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShopData = async () => {
    try {
      const response = await fetch("/api/users/get-user-shop-info", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setShopData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading shop profile..." />
      </DashboardLayoutWrapper>
    );
  }

  if (error) {
    return (
      <DashboardLayoutWrapper>
        <Alert className="flex flex-row items-center w-full shadow-lg rounded-lg p-4">
          <CircleAlert className="scale-[200%] h-[60%] stroke-red-500" />
          <div className="flex flex-col justify-center ml-10">
            <AlertTitle className="text-lg font-bold text-red-500">Error</AlertTitle>
            <AlertDescription className="tracking-wide font-light text-red-300">
              {error}
            </AlertDescription>
          </div>
        </Alert>
      </DashboardLayoutWrapper>
    );
  }

  const {
    shopNo,
    name,
    logo,
    description,
    contactNo,
    email,
    status,
    openingTime,
    closingTime,
    address,
  } = shopData;

  return (
    <DashboardLayoutWrapper>
      <CardTitle className="text-4xl mb-5">Shop Profile</CardTitle>
      <div className="flex gap-5">
        <div className="flex flex-col gap-2 items-center">
          <Card className="bg-accent p-2">
            <Image
              src={logo || "/images/placeholder-shop-logo.png"}
              alt="Shop Logo"
              objectFit="cover"
              width={300}
              height={300}
              quality={100}
              className="rounded-sm"
            />
          </Card>
        </div>

        <Card className="flex-1 p-5">
          <div className="flex flex-col gap-4">
            <p className="text-base font-semibold">Shop No: {shopNo || "N/A"}</p>
            <p className="text-base font-semibold">Name: {name || "N/A"}</p>
            <p className="text-base font-semibold">
              Description: {description || "No description available"}
            </p>
            <p className="text-base font-semibold">Contact No: {contactNo || "N/A"}</p>
            <p className="text-base font-semibold">Email: {email || "N/A"}</p>
            <p className="text-base font-semibold">Status: {status || "N/A"}</p>
            <p className="text-base font-semibold">
              Opening Time: {openingTime || "N/A"}
            </p>
            <p className="text-base font-semibold">
              Closing Time: {closingTime || "N/A"}
            </p>
            <p className="text-base font-semibold">Address:</p>
            <ul className="ml-4 list-disc">
              <li>Building No: {address?.buildingNo || "N/A"}</li>
              <li>Street: {address?.street || "N/A"}</li>
              <li>Barangay: {address?.barangay || "N/A"}</li>
              <li>Municipality: {address?.municipality || "N/A"}</li>
              <li>Province: {address?.province || "N/A"}</li>
              <li>Postal Code: {address?.postalCode || "N/A"}</li>
              <li>
                Google Map:{" "}
                {address?.googleMapLocation?.name ? (
                  <a
                    href={`https://www.google.com/maps?q=${address.googleMapLocation.latitude},${address.googleMapLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {address.googleMapLocation.name}
                  </a>
                ) : (
                  "N/A"
                )}
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}
