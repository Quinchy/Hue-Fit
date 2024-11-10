// components/ManageShopRequest.js

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
import manageShopRequestSchema from '@/utils/validation-schema';
import { LoadingMessage } from "@/components/ui/loading-message";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage, InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";

export default function ManageShopRequest() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      username: "",
      password: "",
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
          ...(values.status === "ACTIVE" && { username: values.username, password: values.password }),
        };
        const response = await fetch(`/api/shop-requests/update-shop-requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message || "An unexpected error occurred.");
        router.push(routes.shopRequest);
      } catch (error) {
        setErrorMessage(error.message || "Failed to submit the request. Please try again.");
      } finally {
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

  return (
    <DashboardLayoutWrapper>
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
            <CardTitle className="text-2xl">Shop Information</CardTitle>
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
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl">Location on Map</CardTitle>
              <MapView latitude={request.latitude} longitude={request.longitude} />
              <div className="flex flex-col gap-2 mt-4 mb-4">
                <Label>Google Map Place Name</Label>
                <Input readOnly value={request.googleMapPlaceName || 'N/A'} className="cursor-default" />
              </div>
            </div>
            <div className="flex flex-col items-start gap-2">
              <Label>Business License URL</Label>
              {request.businessLicense ? (
                <BusinessLicense imageUrl={request.businessLicense} />
              ) : (
                <p>N/A</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                name="status"
                value={formik.values.status}
                onValueChange={(value) => formik.setFieldValue("status", value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <InputErrorMessage error={formik.errors.status} touched={formik.touched.status} />
            </div>

            {errorMessage && <ErrorMessage message={errorMessage} className="text-red-500 mt-4" />}

            {formik.values.status === "ACTIVE" && (
              <div className="flex flex-col gap-4 mt-6">
                <CardTitle className="text-2xl">Create Vendor Account</CardTitle>
                <div className="flex flex-col gap-2">
                  <Label>Username</Label>
                  <Input
                    name="username"
                    placeholder="Enter username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={InputErrorStyle(formik.errors.username, formik.touched.username)}
                  />
                  <InputErrorMessage error={formik.errors.username} touched={formik.touched.username} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Password</Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={InputErrorStyle(formik.errors.password, formik.touched.password)}
                  />
                  <InputErrorMessage error={formik.errors.password} touched={formik.touched.password} />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-4" disabled={submitting}>
              {submitting ? <LoadingMessage message="Submitting..." /> : "Submit"}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayoutWrapper>
  );
}
