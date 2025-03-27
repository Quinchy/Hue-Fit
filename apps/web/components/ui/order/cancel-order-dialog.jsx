// components/ui/order/cancel-order-dialog.js
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Asterisk } from "lucide-react";
import axios from "axios";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function CancelOrderDialog({
  orderNo,
  open,
  onClose,
  onConfirm,
}) {
  const formik = useFormik({
    initialValues: { reason: "" },
    validationSchema: Yup.object({
      reason: Yup.string().required("Cancellation reason is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onConfirm(orderNo, values.reason);
        onClose();
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to cancel this order?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Once cancelled, the order cannot be
            recovered. Please state a valid reason to why you are cancelling
            this order.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-row">
              <Label htmlFor="reason" className="font-semibold">
                Cancellation Reason
              </Label>
              <Asterisk className="w-4 h-4 mt-[1px]" />
            </div>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Enter reason..."
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`h-24 ${InputErrorStyle(
                formik.errors.reason,
                formik.touched.reason
              )}`}
              required
            />
            <InputErrorMessage
              error={formik.errors.reason}
              touched={formik.touched.reason}
            />
          </div>
          <DialogFooter className="grid grid-cols-2">
            <Button type="submit" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? <LoadingMessage message="Submitting..." /> : "Submit"}
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
