import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { MoveLeft } from "lucide-react";
import { Loader2, CheckCircle2 } from "lucide-react";
import routes from "@/routes";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditOrder() {
  const router = useRouter();
  const { orderNo } = router.query; // Get orderNo from URL params

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
      setOrderDetails(response.data.order);
      setStatus(response.data.order.status);
    } catch (error) {
      setError("Failed to fetch order details.");
    }
  };

  const handleStatusChange = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post("/api/orders/update-order", { orderNo, status });

      // Refresh order details after update
      fetchOrderDetails(orderNo);
      
      // Show success alert
      setShowAlert(true);
    } catch (error) {
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
          <CardTitle className="text-4xl"><Skeleton className="h-10 w-96 mb-5" /></CardTitle>
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

  return (
    <DashboardLayoutWrapper> 
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Edit Order - {orderDetails.orderNo}</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/order')}>
          <MoveLeft className="scale-125" />
          Back to Orders
        </Button>
      </div>
      <Card className="p-10 flex flex-col gap-5 mb-20">
        <div>
          <CardTitle className="text-2xl min-w-[16.5rem]">Customer Information</CardTitle>
          <p>Customer Name: {orderDetails.User.name}</p>
        </div>
        <div className="flex flex-row gap-10">
          <div>
            <CardTitle className="text-2xl min-w-[16.5rem]">Product Image</CardTitle>
            {orderDetails.ProductVariant.imageUrl ? (
              <Image 
                src={orderDetails.ProductVariant.imageUrl}
                alt="Product Image"
                width={450}
                height={450}
                quality={75}
                className="object-fill rounded max-w-[375px] max-h-[450px] min-w-[375px] min-h-[450px]"
                priority
              />
            ) : (
              <p>No image available</p>
            )}
          </div>
          <div>
            <CardTitle className="text-2xl min-w-[16.5rem]">Order Information</CardTitle>
            <p>Product Name: {orderDetails.ProductVariant.Product.name}</p>
            <p>Variant: {orderDetails.ProductVariant.Color.name}</p>
            <p>Size: {orderDetails.Size.name}</p>
            <p>Quantity: {orderDetails.quantity}</p>
            <p>Price: ₱{orderDetails.ProductVariant.price}</p>
          </div>
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
            </SelectContent>
          </Select>
          <Button
            onClick={handleStatusChange}
            className="w-full mt-2"
            disabled={loading || status === orderDetails.status}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 text-card" /> : 'Update Status'}
          </Button>
        </div>

        <div className="mt-4">
          <CardTitle className="text-2xl min-w-[16.5rem]">Order History</CardTitle>
          <ul>
            {orderDetails.OrderHistories.map((history) => (
              <li key={history.changed_at}>
                {history.status} - {new Date(history.changed_at).toLocaleString('en-US', {
                  weekday: 'long',   // 'Monday', 'Tuesday', etc.
                  year: 'numeric',   // '2024'
                  month: 'long',     // 'November'
                  day: 'numeric',    // '29'
                  hour: '2-digit',   // '09'
                  minute: '2-digit', // '00'
                  hour12: true,      // 12-hour format (AM/PM)
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
            <AlertTitle className="text-green-400 text-base font-semibold">Status Updated</AlertTitle>
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
