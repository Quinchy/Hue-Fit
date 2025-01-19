import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import {
  MoveLeft,
  Loader2,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";
import routes from "@/routes";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import { ScrollArea } from "@/components/ui/scroll-area";

// Step definitions, linear pipeline
const ORDER_STEPS_DATA = [
  { id: "PROCESSING", label: "Processing", Icon: Loader2 },
  { id: "PACKAGING",  label: "Packaging",  Icon: Package },
  { id: "DELIVERING", label: "Delivering", Icon: Truck },
  { id: "COMPLETED",  label: "Completed",  Icon: CheckCircle2 },
];

// Helper to get next status in the pipeline (or stay if already last).
function getNextStatus(currentStatus) {
  const index = ORDER_STEPS_DATA.findIndex((step) => step.id === currentStatus);
  if (index < 0 || index >= ORDER_STEPS_DATA.length - 1) {
    return currentStatus; // No further step
  }
  return ORDER_STEPS_DATA[index + 1].id;
}

export default function EditOrder() {
  const router = useRouter();
  const { orderNo } = router.query;

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (orderNo) {
      fetchOrderDetails(orderNo);
    }
  }, [orderNo]);

  const fetchOrderDetails = async (orderNoVal) => {
    try {
      const response = await axios.get(
        `/api/orders/get-order-detail?orderNo=${orderNoVal}`
      );
      const fetchedOrder = response.data.order;
      setOrderDetails(fetchedOrder);
    } catch (err) {
      setError("Failed to fetch order details.");
    }
  };

  /**
   * Move order to the next status in the pipeline, update local state:
   * user will see the updated progress bar and status immediately.
   */
  const handleAdvanceStep = async () => {
    if (!orderDetails) return;
    try {
      setLoading(true);
      setError(null);

      const nextStatus = getNextStatus(orderDetails.status);
      await axios.post("/api/orders/update-order", {
        orderNo,
        status: nextStatus,
      });

      // Update local state with the new status
      setOrderDetails((prev) => ({
        ...prev,
        status: nextStatus,
      }));

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
        <Loading message="Loading order..." />
      </DashboardLayoutWrapper>
    );
  }

  // Sum up total cost
  const totalEarnings =
    orderDetails.OrderItems?.reduce((sum, item) => {
      const price = parseFloat(item.ProductVariant?.price || 0);
      return sum + price * (item.quantity || 0);
    }, 0) || 0;

  // If no custom picture, fallback
  const profilePicture =
    orderDetails.User?.profilePicture || "/images/profile-picture.png";

  // Identify which step is active for the progress bar
  const currentStepIndex = ORDER_STEPS_DATA.findIndex(
    (step) => step.id === orderDetails.status
  );
  // Check if can still advance
  const canAdvance =
    currentStepIndex >= 0 && currentStepIndex < ORDER_STEPS_DATA.length - 1;

  // Calculate percentage for solid line overlay
  const progressPercentage =
    currentStepIndex > 0
      ? (currentStepIndex / (ORDER_STEPS_DATA.length - 1)) * 100
      : 0;

  return (
    <DashboardLayoutWrapper>
      {/* Top-level header bar */}
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center gap-4">
          <CardTitle className="text-4xl">
            Order: {orderDetails.orderNo}
          </CardTitle>
          <p className="bg-yellow-500 px-3 py-1 rounded text-card font-bold">
            {orderDetails.status}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(routes.order)}>
          <MoveLeft className="scale-125" />
          Back to Orders
        </Button>
      </div>

      {/* Main card */}
      <Card className="p-10 flex flex-col gap-8">
        {/* 1) PROGRESS BAR */}
        <div className="relative flex items-center justify-between px-2 h-20">
          {/* Dashed base line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 border-t-2 border-dashed border-border" />
          {/* Solid overlay for completed steps */}
          <div
            className="absolute top-4 left-0 h-0.5 bg-primary"
            style={{ width: `${progressPercentage}%` }}
          />

          {ORDER_STEPS_DATA.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const StepIcon = step.Icon;
            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    isActive
                      ? "bg-primary border-primary text-card"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {/* Icon & Label below */}
                <div className="mt-2 flex flex-col items-center text-xs">
                  <StepIcon
                    className={`w-4 h-4 mb-1 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <p
                    className={`${
                      isActive ? "font-semibold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2) ORDER ITEMS */}
        <div>
          <CardTitle className="text-2xl mb-2">Order Items</CardTitle>
          <ScrollArea className="h-72 border rounded-md p-3">
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
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3 mb-3 last:mb-0 last:border-none"
                  >
                    <div className="flex items-center gap-3">
                      {firstImageURL && (
                        <Image
                          src={firstImageURL}
                          alt="Product Variant Image"
                          width={60}
                          height={60}
                          className="object-cover rounded"
                        />
                      )}
                      <div className="text-sm">
                        <p className="font-semibold">{productName}</p>
                        <p className="text-muted-foreground">
                          Color: {colorName} | Size: {sizeName}
                        </p>
                        <p className="text-muted-foreground">
                          Qty: {item.quantity} | PHP {variantPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No items for this order.</p>
            )}
          </ScrollArea>
        </div>

        {/* 3) CUSTOMER INFO */}
        <div>
          <CardTitle className="text-2xl">Customer Information</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <Image
              src={profilePicture}
              alt="Profile Picture"
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded-full"
            />
            <div>
              <p className="font-semibold text-lg">{orderDetails.User.name}</p>
              <p className="text-sm">Payment Method: Cash on Delivery</p>
            </div>
          </div>
        </div>

        {/* 4) ACTION & TOTAL */}
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          {/* "Advance to Next Step" or "Already Completed" */}
          <div>
            <CardTitle className="text-2xl">Order Status</CardTitle>
            {canAdvance ? (
              <Button
                onClick={handleAdvanceStep}
                className="mt-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 text-card" />
                ) : (
                  "Advance to Next Step"
                )}
              </Button>
            ) : (
              <p className="mt-2 text-muted-foreground italic">
                This order is already completed.
              </p>
            )}
          </div>

          {/* Total Payment */}
          <div className="text-right">
            <CardTitle className="text-xl">Total Payment</CardTitle>
            <p className="font-semibold text-lg">PHP {totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Alert on success */}
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
