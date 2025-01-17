import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { MoveLeft, Loader2, CheckCircle2 } from "lucide-react";
import routes from "@/routes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function EditOrder() {
  const router = useRouter();
  const { orderNo } = router.query;

  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (orderNo) {
      fetchOrderDetails(orderNo);
    }
  }, [orderNo]);

  const fetchOrderDetails = async (orderNo) => {
    try {
      const response = await axios.get(`/api/orders/get-order-detail?orderNo=${orderNo}`);
      const fetchedOrder = response.data.order;
      setOrderDetails(fetchedOrder);
      setStatus(fetchedOrder.status);
    } catch (err) {
      setError("Failed to fetch order details.");
    }
  };

  const handleStatusChange = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post("/api/orders/update-order", { orderNo, status });
      await fetchOrderDetails(orderNo);
      setShowAlert(true);
    } catch (err) {
      setError("Failed to update order status.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!orderDetails) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex justify-between items-center mb-5">
          <CardTitle className="text-4xl">
            <Skeleton className="h-10 w-96 mb-5" />
          </CardTitle>
        </div>
        <Card className="p-10 flex flex-col gap-5">
          <Skeleton className="h-10 w-48 mb-5" />
          <Skeleton className="h-10 w-full mb-5" />
          <Skeleton className="h-10 w-full mb-5" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </DashboardLayoutWrapper>
    );
  }

  // Compute total earnings for the entire order
  const totalEarnings = orderDetails.OrderItems?.reduce((sum, item) => {
    const price = parseFloat(item.ProductVariant?.price || 0);
    return sum + price * (item.quantity || 0);
  }, 0) || 0;

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Edit Order - {orderDetails.orderNo}</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.order)}>
          <MoveLeft className="scale-125" />
          Back to Orders
        </Button>
      </div>

      <Card className="p-10 flex flex-col gap-5 mb-20">
        <div>
          <CardTitle className="text-2xl min-w-[16.5rem]">Customer Information</CardTitle>
          <p>Customer Name: {orderDetails.User.name}</p>
        </div>

        <div>
          <CardTitle className="text-2xl min-w-[16.5rem]">Order Items</CardTitle>
          {orderDetails.OrderItems && orderDetails.OrderItems.length > 0 ? (
            orderDetails.OrderItems.map((item) => {
              const productName = item.Product?.name || "N/A";
              const colorName = item.ProductVariant?.Color?.name || "N/A";
              const sizeName = item.ProductVariantSize?.Size?.name || "N/A";
              const variantPrice = item.ProductVariant?.price
                ? parseFloat(item.ProductVariant.price).toFixed(2)
                : "0.00";
              const firstImageURL =
                item.ProductVariant?.ProductVariantImage?.[0]?.imageURL || null;

              return (
                <div key={item.id} className="border-b py-4">
                  {firstImageURL && (
                    <Image
                      src={firstImageURL}
                      alt="Product Variant Image"
                      width={140}
                      height={140}
                      className="object-cover rounded mb-3"
                    />
                  )}
                  <p>Product: {productName}</p>
                  <p>Color: {colorName}</p>
                  <p>Size: {sizeName}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ₱{variantPrice}</p>
                </div>
              );
            })
          ) : (
            <p>No items for this order.</p>
          )}
        </div>

        <div>
          <CardTitle className="text-2xl min-w-[16.5rem]">Total Earnings</CardTitle>
          <p className="font-semibold text-lg">₱{totalEarnings.toFixed(2)}</p>
        </div>

        <div className="mt-4">
          <CardTitle className="text-2xl min-w-[16.5rem]">Order Status</CardTitle>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROCESSING">PROCESSING</SelectItem>
              <SelectItem value="PREPARING">PREPARING</SelectItem>
              <SelectItem value="PACKAGING">PACKAGING</SelectItem>
              <SelectItem value="DELIVERING">DELIVERING</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleStatusChange}
            className="w-full mt-2"
            disabled={loading || status === orderDetails.status}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 text-card" /> : "Update Status"}
          </Button>
        </div>

        <div className="mt-4">
          <CardTitle className="text-2xl min-w-[16.5rem]">Order History</CardTitle>
          <ul>
            {orderDetails.OrderHistory?.map((history) => (
              <li key={history.changed_at}>
                {history.status} -{" "}
                {new Date(history.changed_at).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] right-10 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Status Updated
            </AlertTitle>
            <AlertDescription className="text-green-300">
              The order status has been updated successfully.
            </AlertDescription>
          </div>
          <button
            className="ml-auto mr-4 hover:text-primary/50 focus:outline-none"
            onClick={() => setShowAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}
    </DashboardLayoutWrapper>
  );
}
