import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MapView from '@/components/ui/map-view';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoveLeft } from 'lucide-react';
import formatDate from '@/utils/date-helpers';
import routes from '@/routes';
import BusinessLicense from '@/components/ui/business-license';
import { useFormik } from 'formik';
import { manageShopRequestSchema } from '@/utils/validation-schema';
import { LoadingMessage } from "@/components/ui/loading-message";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage, InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from 'lucide-react';
import { Asterisk } from 'lucide-react';

export default function ManageShopRequest() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const { requestNo } = router.query;

  useEffect(() => {
    if (requestNo) {
      const fetchRequest = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/shop-requests/get-manage-shop-request?requestNo=${requestNo}`);
          const data = await response.json();
          setRequest(data);  // Set the full request data
        } catch (error) {
          console.error("Error fetching request data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [requestNo]);

  const formik = useFormik({
    initialValues: {
      status: request?.status || "",
      email: request?.contactPerson?.email || "",
      message: "",
    },
    enableReinitialize: true,
    validationSchema: manageShopRequestSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      setErrorMessage("");
      try {
        const requestPayload = {
          requestNo: request.requestNo,
          status: values.status,
          email: values.email,
          message: values.message,
        };
        const response = await fetch(`/api/shop-requests/update-shop-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message || "An unexpected error occurred.");
        if (values.status === "ACTIVE") {
          router.push(`${routes.shopRequest}?alert=accepted`);
        } 
        else if (values.status === "REJECTED") {
          router.push(`${routes.shopRequest}?alert=rejected`);
        }
        else if (values.status === "PENDING" && values.message) {
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        } else {
          router.push(routes.shopRequest);
        }
      } 
      catch (error) {
        setErrorMessage(error.message || "Failed to submit the request. Please try again.");
      } 
      finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Card className="flex flex-col gap-5 mt-5 mb-20">
          <div className='flex flex-col gap-14'>
            <div className='flex flex-col gap-2'>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-7 w-1/2" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </Card>
      </DashboardLayoutWrapper>
    );
  }

  if (!request) {
    return <p>Request not found</p>;
  }

  const handleGoBack = () => {
    router.push(routes.shopRequest);
  };

  const handleStatusChange = (value) => {
    formik.setFieldValue("status", value);
    if (value === "ACTIVE") {
      formik.setFieldValue(
        "message",
        "Congratulations! Your partnership request has been approved, and your vendor account has been activated. You can now access the vendor dashboard by logging in at https://hue-fit-web.vercel.app/account/login."
      );
    } else if (value === "REJECTED") {
      formik.setFieldValue(
        "message",
        "We regret to inform you that your partnership request has not been approved. Thank you for your interest in HueFit."
      );
    } else {
      formik.setFieldValue("message", "");
    }
  };

  const isStatusLocked = request.status === "DONE";

  return (
    <DashboardLayoutWrapper>
      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] right-10 bottom-10 flex items-center shadow-accent shadow-lg rounded-lg">
          <MailCheck className="h-10 w-10 stroke-sky-500" />
          <div className="ml-7">
            <AlertTitle className="text-sky-500 text-base font-semibold">Pending Request Updated</AlertTitle>
            <AlertDescription className="text-sky-400">
              The email message has been send successfully.
            </AlertDescription>
          </div>
          <button
            className="ml-auto mr-4 hover:text-sky-700 focus:outline-none"
            onClick={() => setShowAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}
      <div className='flex flex-row items-center justify-between'>
        <div className='flex flex-row gap-2 items-center'>
          <CardTitle className="text-4xl">Request Number:</CardTitle>
          <p className='text-3xl font-bold'>{request.requestNo}</p>
        </div>
        <Button variant="outline" onClick={handleGoBack} className="font-normal">
          <MoveLeft className="scale-125" />
          Back to Shop Requests
        </Button>
      </div>
      <Card className="flex flex-col gap-10 mt-5 mb-20">
        <div className='flex flex-row justify-between mb-5'>
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 items-center">
              <CardTitle className="text-2xl">Date Created:</CardTitle>
              <p>{formatDate(request.created_at)}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <CardTitle className="text-2xl">Last Update:</CardTitle>
              <p>{formatDate(request.updated_at)}</p>
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className='flex flex-col gap-5'>
            <CardTitle className="text-2xl">Contact Person Information</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              {request.contactPerson && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>First Name</Label>
                    <Input readOnly value={request.contactPerson.firstName} className="cursor-default" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Last Name</Label>
                    <Input readOnly value={request.contactPerson.lastName} className="cursor-default" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Contact Number</Label>
                    <Input readOnly value={request.contactPerson.contactNo} className="cursor-default" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Email</Label>
                    <Input readOnly value={request.contactPerson.email} className="cursor-default" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Position</Label>
                    <Input readOnly value={request.contactPerson.position} className="cursor-default" />
                  </div>
                </>
              )}
            </div>

            <CardTitle className="text-2xl mt-8">Shop Information</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Shop Name</Label>
                <Input readOnly value={request.shopName} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Shop Contact Number</Label>
                <Input readOnly value={request.shopContactNo} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Building Number</Label>
                <Input readOnly value={request.buildingNo || 'N/A'} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Street</Label>
                <Input readOnly value={request.street || 'N/A'} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Barangay</Label>
                <Input readOnly value={request.barangay} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Municipality</Label>
                <Input readOnly value={request.municipality} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Province</Label>
                <Input readOnly value={request.province} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Postal Number</Label>
                <Input readOnly value={request.postalNumber} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Longitude</Label>
                <Input readOnly value={request.longitude || 'N/A'} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Latitude</Label>
                <Input readOnly value={request.latitude || 'N/A'} className="cursor-default" />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-8">
              <Label>Location on Map</Label>
              <MapView latitude={request.latitude} longitude={request.longitude} />
              <div className="flex flex-col gap-2 mt-4 mb-4">
                <Label>Google Map Place Name</Label>
                <Input readOnly value={request.googleMapPlaceName || 'N/A'} className="cursor-default" />
              </div>
            </div>

            <Label>Business License URLs</Label>
            <div className="flex flex-row items-center gap-5">
              {request.businessLicense.length > 0 ? (
                request.businessLicense.map((url, index) => (
                  <BusinessLicense key={index} imageUrl={url} />
                ))
              ) : (
                <p>No business licenses available.</p>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-8">
              <Label className="font-bold flex flex-row items-center">Status<Asterisk className="w-4" /></Label>
              <Select
                name="status"
                value={formik.values.status || request?.shopStatus}
                onValueChange={(value) => {
                  formik.setFieldValue("status", value);
                  handleStatusChange(value);
                }}
                disabled={isStatusLocked}
                className="w-[180px]"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                    <SelectItem value="ACTIVE">ACCEPTED</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <InputErrorMessage error={formik.errors.status} touched={formik.touched.status} />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-bold flex flex-row items-center">Message<Asterisk className="w-4" /></Label>
              <Textarea
                value={formik.values.message}
                onChange={formik.handleChange}
                name="message"
                placeholder="Write a message"
                rows={4}
                className={`${InputErrorStyle(formik.errors.message, formik.touched.message)}`}
              />
               <InputErrorMessage error={formik.errors.message} touched={formik.touched.message} />
            </div>
            {errorMessage && <ErrorMessage message={errorMessage} className="text-red-500 mt-4" />}
            
            {!isStatusLocked && (
              <Button type="submit" className="w-full mt-4" disabled={submitting}>
                {submitting ? <LoadingMessage message="Submitting..." /> : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </DashboardLayoutWrapper>
  );
}
