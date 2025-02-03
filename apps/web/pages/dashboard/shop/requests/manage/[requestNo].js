// Updated UI: ManageShopRequest component
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MapView from '@/components/ui/map-view';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoveLeft, Store, Contact, FileText, SquarePen  } from 'lucide-react';
import formatDate from '@/utils/date-helpers';
import routes from '@/routes';
import BusinessLicense from '@/components/ui/business-license';
import { useFormik } from 'formik';
import { manageShopRequestSchema } from '@/utils/validation-schema';
import { LoadingMessage } from "@/components/ui/loading-message";
import { ErrorMessage, InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from 'lucide-react';
import { Asterisk } from 'lucide-react';
import Loading from '@/components/ui/loading';
import Image from 'next/image';

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
          setRequest(data);
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
        } else if (values.status === "REJECTED") {
          router.push(`${routes.shopRequest}?alert=rejected`);
        } else if (values.status === "PENDING" && values.message) {
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
        <Loading message="Loading shop request..." />
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
        <CardTitle className="text-4xl">Shop Request</CardTitle>
        <Button variant="outline" onClick={handleGoBack} className="font-normal">
          <MoveLeft className="scale-125" />
          Back to Shop Requests
        </Button>
      </div>
      <div className="flex flex-col gap-5 mb-20">
        <Card className="p-5">
          <div className='flex flex-row gap-2 items-center'>
            <Label className="text-base">Request Number:</Label>
            <p className='text-base font-light text-primary/80'>{request.requestNo}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <Label className="text-base">Date Submitted:</Label>
            <p className='text-base font-light text-primary/80'>{formatDate(request.created_at)}</p>
          </div>
        </Card>
        <form onSubmit={formik.handleSubmit}>
          <div className='flex flex-row gap-2 items-stretch'>
            {/* Shop Information Section (Left Side) */}
            <Card className="p-5 w-[60%]">
              <CardTitle className="text-2xl flex items-center gap-2"><Store/>{"Shop Information"}</CardTitle>
              <div className="mt-4 flex flex-col gap-4">
                <div className='flex flex-row gap-4'>
                  <div className="border-2 border-dashed border-primary/20 p-2 flex rounded-lg">
                    {request.shopLogo ? (
                      <Image src={request.shopLogo} alt="Shop Logo" width={150} height={150} />
                    ) : (
                      <Image src="/images/placeholder-picture.png" alt="Shop Logo" width={150} height={150} />
                    )}
                  </div>
                  <div className='flex flex-col gap-1 bg-muted p-2 rounded-lg w-full'>
                    <div className="flex flex-row items-center gap-2">
                      <Label className="text-base">{"Name:"}</Label>
                      <p className='font-light text-primary/80'>{request.shopName}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Label className="text-base">{"Shop Email:"}</Label>
                      <p className='font-light text-primary/80'>{request.shopEmail}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Label className="text-base">{"Shop Contact Number:"}</Label>
                      <p className='font-light text-primary/80'>{request.shopContactNo}</p>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Label className="text-base">{"Shop Hours:"}</Label>
                      <div className="flex flex-row gap-1 font-light text-primary/80">
                        <p>{request.openingTime}</p>
                        {" - "}
                        <p>{request.closingTime}</p>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <Label className="text-base">{"Full Address:"}</Label>
                      <p className="font-light text-primary/80">
                        {[
                          request.buildingNo !== 'N/A' ? request.buildingNo : null,
                          request.street !== 'N/A' ? request.street : null,
                          request.barangay,
                          request.municipality,
                          request.province,
                          request.postalNumber
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Label className="text-lg">{"Location on Google Map:"}</Label>
                <div className="relative">
                  <MapView latitude={request.latitude} longitude={request.longitude} />
                  <div className="absolute top-0 left-0 m-2 bg-card/75 p-3 border border-border rounded-lg shadow">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row items-center gap-2">
                        <Label className="text-base">{"Google Map Place Name:"}</Label>
                        <p className="font-light text-primary/80">{request.googleMapPlaceName || 'N/A'}</p>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <Label className="text-base">{"Longitude:"}</Label>
                        <p className="font-light text-primary/80">{request.longitude || 'N/A'}</p>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <Label className="text-base">{"Latitude:"}</Label>
                        <p className="font-light text-primary/80">{request.latitude || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            {/* 3 Rowed Section (Right Side) */}
            <div className='flex flex-col gap-2 w-[40%]'>
              <Card className="p-5 flex-1">
                <CardTitle className="text-2xl flex items-center gap-2"><Contact/>{"Contact Person"}</CardTitle>
                <div className="mt-4 flex flex-col gap-1 bg-muted p-2 rounded-lg w-full">
                  {request.contactPerson && (
                    <>
                      <div className="flex flex-row items-center gap-2">
                        <Label className="text-base">{"Name:"}</Label>
                        <div className="flex flex-row gap-1">
                          <p className='font-light text-primary/80'>{request.contactPerson.firstName}</p>
                          <p className='font-light text-primary/80'>{request.contactPerson.lastName}</p>
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <Label className="text-base">{"Contact Number:"}</Label>
                        <p className='font-light text-primary/80'>{request.contactPerson.contactNo}</p>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <Label className="text-base">{"Email:"}</Label>
                        <p className='font-light text-primary/80'>{request.contactPerson.email}</p>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <Label className="text-base">{"Position:"}</Label>
                        <p className='font-light text-primary/80'>{request.contactPerson.position}</p>
                      </div>
                    </>
                  )}
                </div>
              </Card>
              <Card className="p-5 flex-1">
                <CardTitle className="text-2xl flex items-center gap-2"><FileText/>{"Submitted Business License/s"}</CardTitle>
                <div className="mt-4 flex flex-row items-center gap-3 bg-muted p-2 rounded-lg overflow-x-auto">
                  {request.businessLicense.length > 0 ? (
                    request.businessLicense.map((url, index) => (
                      <BusinessLicense key={index} imageUrl={url} />
                    ))
                  ) : (
                    <p className="text-base font-light text-primary/80">
                      No business licenses available.
                    </p>
                  )}
                </div>
              </Card>
              <Card className="p-5 flex-1">
                <CardTitle className="text-2xl flex items-center gap-2"><SquarePen/>{"Update Shop Request"}</CardTitle>
                <div className='mt-4 flex flex-col gap-2'>
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-bold flex flex-row items-center">Update Request Status<Asterisk className="w-4" /></Label>
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
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-bold flex flex-row items-center">Message<Asterisk className="w-4" /></Label>
                    <Textarea
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      name="message"
                      placeholder="Write a message"
                      rows={4}
                      className={`${InputErrorStyle(formik.errors.message, formik.touched.message)} h-[12rem]`}
                    />
                    <InputErrorMessage error={formik.errors.message} touched={formik.touched.message} />
                  </div>
                </div>
                {errorMessage && <ErrorMessage message={errorMessage} className="text-red-500 mt-4" />}
                {!isStatusLocked && (
                  <Button type="submit" className="w-full mt-8" disabled={submitting}>
                    {submitting ? <LoadingMessage message="Submitting..." /> : "Submit"}
                  </Button>
                )}
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayoutWrapper>
  );
}
