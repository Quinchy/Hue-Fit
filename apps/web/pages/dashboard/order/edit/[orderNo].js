// pages/dashboard/order/edit/[orderNo].js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import {
  MoveLeft,
  Loader2,
  CheckCircle2,
  Package,
  Truck,
  Asterisk,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import routes from "@/routes";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingMessage } from "@/components/ui/loading-message";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import CancelOrderDialog from "@/components/ui/order/cancel-order-dialog";

const ORDER_STEPS_DATA = [
  { id: "PENDING", label: "Pending", Icon: Loader2 },
  { id: "PROCESSING", label: "Processing", Icon: Package },
  { id: "DELIVERING", label: "Delivering", Icon: Truck },
  { id: "COMPLETED", label: "Completed", Icon: CheckCircle2 },
];

function getNextStatus(currentStatus) {
  const index = ORDER_STEPS_DATA.findIndex((step) => step.id === currentStatus);
  if (index < 0 || index >= ORDER_STEPS_DATA.length - 1) {
    return currentStatus;
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
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false);

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
      setOrderDetails(response.data.order);
    } catch (err) {
      setError("Failed to fetch order details.");
    }
  };

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
      setOrderDetails((prev) => ({ ...prev, status: nextStatus }));
      setShowAlert(true);
    } catch (err) {
      setError("Failed to update order status.");
    } finally {
      setLoading(false);
    }
  };

  const cancellationFormik = useFormik({
    initialValues: {
      cancellationResponse: "",
      rejectionReason: "",
    },
    validationSchema: Yup.object({
      cancellationResponse: Yup.string().required("Please select a response."),
      rejectionReason: Yup.string().when("cancellationResponse", {
        is: "REJECT",
        then: () =>
          Yup.string().required("Please provide a reason for rejection."),
        otherwise: () => Yup.string().nullable(),
      }),
    }),
    onSubmit: async (values, { setSubmitting, setStatus, resetForm }) => {
      if (!orderDetails) return;
      try {
        const payload = {
          orderId: orderDetails.id,
          action: values.cancellationResponse,
          rejectionReason:
            values.cancellationResponse === "REJECT"
              ? values.rejectionReason
              : null,
        };
        await axios.post("/api/orders/cancellation-response", payload);
        setShowCancelAlert(true);
        fetchOrderDetails(orderNo);
        resetForm();
      } catch (err) {
        setStatus("Failed to submit response.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCancelOrder = async (orderId, reason) => {
    try {
      setLoading(true);
      await axios.post("/api/orders/cancel-order", {
        orderId: orderDetails.id,
        reason,
      });
      setShowCancelAlert(true);
      fetchOrderDetails(orderNo);
    } catch (err) {
      setError("Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>{error}</div>;

  if (!orderDetails) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading order..." />
      </DashboardLayoutWrapper>
    );
  }

  const totalEarnings =
    orderDetails.OrderItems?.reduce((sum, item) => {
      const price = parseFloat(item.ProductVariant?.price || 0);
      return sum + price * (item.quantity || 0);
    }, 0) || 0;

  let deliveryFeeAmount = 0;
  if (
    orderDetails.Shop?.DeliveryFee &&
    orderDetails.Shop.DeliveryFee.length > 0
  ) {
    const feeRecord = orderDetails.Shop.DeliveryFee[0];
    if (feeRecord.feeType === "FIXED") {
      deliveryFeeAmount = parseFloat(feeRecord.feeAmount);
    } else if (feeRecord.feeType === "PERCENTAGE") {
      deliveryFeeAmount =
        totalEarnings * (parseFloat(feeRecord.feeAmount) / 100);
    }
  }
  const finalTotal = totalEarnings + deliveryFeeAmount;
  const profilePicture =
    orderDetails.User?.profilePicture || "/images/profile-picture.png";

  const currentStepIndex = ORDER_STEPS_DATA.findIndex(
    (step) => step.id === orderDetails.status
  );
  const canAdvance =
    currentStepIndex >= 0 && currentStepIndex < ORDER_STEPS_DATA.length - 1;
  const progressPercentage =
    currentStepIndex > 0
      ? (currentStepIndex / (ORDER_STEPS_DATA.length - 1)) * 100
      : 0;

  const customerAddress = orderDetails.User?.address
    ? [
        orderDetails.User.address.buildingNo || "",
        orderDetails.User.address.street || "",
        orderDetails.User.address.barangay || "",
        orderDetails.User.address.municipality || "",
        orderDetails.User.address.province || "",
        orderDetails.User.address.postalCode || "",
      ]
        .filter((part) => part.trim() !== "")
        .join(", ")
    : "";

  const statusColors = {
    PENDING: "bg-blue-400",
    PROCESSING: "bg-amber-500",
    DELIVERING: "bg-purple-400",
    COMPLETED: "bg-green-400",
    CANCELLED: "bg-red-500",
  };

  const canCancel = ["PENDING", "PROCESSING", "DELIVERING"].includes(
    orderDetails.status.toUpperCase()
  );

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center gap-4">
          <CardTitle className="text-4xl">
            Order: {orderDetails.orderNo}
          </CardTitle>
          <p
            className={`px-3 py-1 min-w-[10rem] mt-2 text-center rounded text-card font-bold ${
              statusColors[orderDetails.status.toUpperCase()]
            }`}
          >
            {orderDetails.status}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push(routes.order)}>
          <MoveLeft className="scale-125" />
          Back to Orders
        </Button>
      </div>

      <Card className="p-10 flex flex-col gap-8 mb-20">
        <div className="relative flex items-center justify-between px-2 h-20">
          <div className="absolute top-4 left-0 right-0 h-0.5 border-t-2 border-dashed border-border" />
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
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    isActive
                      ? "bg-primary border-primary text-card"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="mt-2 flex flex-col items-center text-xs">
                  <StepIcon
                    className={`w-4 h-4 mb-1 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <p
                    className={
                      isActive
                        ? "font-semibold text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

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
                  item.ProductVariant?.ProductVariantImage?.[0]?.imageURL ||
                  null;
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
              <p className="text-sm">
                Payment Method: {orderDetails.paymentMethod}
              </p>
              <p className="text-sm">Shipping Address: {customerAddress}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
          <div>
            <CardTitle className="text-2xl">Order Status</CardTitle>
            {orderDetails.status.toUpperCase() === "CANCELLED" ? (
              <p className="mt-2 text-muted-foreground italic">
                This order is cancelled.
              </p>
            ) : orderDetails.status.toUpperCase() === "COMPLETED" ? (
              <p className="mt-2 text-muted-foreground italic">
                This order is already completed.
              </p>
            ) : (
              <div className="flex gap-2 mt-2">
                {canAdvance && (
                  <Button
                    onClick={handleAdvanceStep}
                    className="min-w-[15rem]"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingMessage message="Advancing..." />
                    ) : (
                      "Advance to Next Step"
                    )}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    className="min-w-[15rem] border-red-500 text-red-500 bg-transparent hover:text-red-500"
                    onClick={() => setShowCancelOrderDialog(true)}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <CardTitle className="text-xl">Total Payment</CardTitle>
            <p className="font-semibold text-lg">
              PHP {finalTotal.toFixed(2)}{" "}
              {deliveryFeeAmount > 0 && (
                <span className="text-sm text-muted-foreground">
                  (Includes Delivery Fee: PHP {deliveryFeeAmount.toFixed(2)})
                </span>
              )}
            </p>
          </div>
        </div>

        {orderDetails.askingForCancel &&
          orderDetails.status.toUpperCase() !== "CANCELLED" && (
            <div className="flex flex-col gap-4 border-t">
              <CardTitle className="text-2xl mt-5">
                Cancellation Request
              </CardTitle>
              <p>
                <strong>Reason:</strong> {orderDetails.cancelReason}
              </p>
              <form
                onSubmit={cancellationFormik.handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <Label className="flex flex-row items-center font-semibold">
                      Response <Asterisk className="w-4" />
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        cancellationFormik.setFieldValue(
                          "cancellationResponse",
                          value
                        )
                      }
                      value={cancellationFormik.values.cancellationResponse}
                    >
                      <SelectTrigger
                        className={`w-full ${InputErrorStyle(
                          cancellationFormik.errors.cancellationResponse,
                          cancellationFormik.touched.cancellationResponse
                        )}`}
                      >
                        <SelectValue placeholder="Select response" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACCEPT">Accept</SelectItem>
                        <SelectItem value="REJECT">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                    {cancellationFormik.touched.cancellationResponse &&
                      cancellationFormik.errors.cancellationResponse && (
                        <InputErrorMessage
                          error={cancellationFormik.errors.cancellationResponse}
                          touched={
                            cancellationFormik.touched.cancellationResponse
                          }
                        />
                      )}
                  </div>
                  {cancellationFormik.values.cancellationResponse ===
                    "REJECT" && (
                    <div className="flex flex-col gap-1">
                      <Label className="flex flex-row items-center font-semibold">
                        Rejection Reason <Asterisk className="w-4" />
                      </Label>
                      <Textarea
                        className={`w-full border rounded p-2 ${InputErrorStyle(
                          cancellationFormik.errors.rejectionReason,
                          cancellationFormik.touched.rejectionReason
                        )}`}
                        placeholder="Enter rejection reason"
                        {...cancellationFormik.getFieldProps("rejectionReason")}
                      />
                      {cancellationFormik.touched.rejectionReason &&
                        cancellationFormik.errors.rejectionReason && (
                          <InputErrorMessage
                            error={cancellationFormik.errors.rejectionReason}
                            touched={cancellationFormik.touched.rejectionReason}
                          />
                        )}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="mt-10"
                  disabled={cancellationFormik.isSubmitting}
                >
                  {cancellationFormik.isSubmitting ? (
                    <LoadingMessage message="Submitting..." />
                  ) : (
                    "Submit"
                  )}
                </Button>
                {cancellationFormik.status && (
                  <p className="text-red-500 mt-2">
                    {cancellationFormik.status}
                  </p>
                )}
              </form>
            </div>
          )}
      </Card>

      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] right-14 bottom-10 flex items-center shadow-lg rounded-lg">
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

      {showCancelAlert && (
        <Alert className="fixed z-50 w-[30rem] right-14 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Cancellation Response Submitted
            </AlertTitle>
            <AlertDescription className="text-green-300">
              The cancellation response has been submitted successfully.
            </AlertDescription>
          </div>
          <button
            className="ml-auto mr-4 hover:text-primary/50 focus:outline-none"
            onClick={() => setShowCancelAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}

      {showCancelOrderDialog && (
        <CancelOrderDialog
          orderNo={orderDetails.id}
          open={showCancelOrderDialog}
          onClose={() => setShowCancelOrderDialog(false)}
          onConfirm={handleCancelOrder}
        />
      )}
    </DashboardLayoutWrapper>
  );
}
