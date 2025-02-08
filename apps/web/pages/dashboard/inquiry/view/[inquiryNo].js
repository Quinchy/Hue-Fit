// File: pages/dashboard/inquiry/view/[inquiryNo].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import routes from "@/routes";
import Loading from "@/components/ui/loading";

export default function ViewInquiry() {
  const router = useRouter();
  const { inquiryNo } = router.query;
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInquiryDetails = async () => {
    if (!inquiryNo) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/inquiry/get-inquiry-details?inquiryNo=${inquiryNo}`);
      const data = await response.json();
      setInquiry(data);
    } catch (error) {
      console.error("Error fetching inquiry details:", error);
    } finally {
      setLoading(false);
    }
  };

  const markInquiryRead = async () => {
    if (!inquiryNo) return;
    try {
      await fetch("/api/inquiry/mark-inquiry-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryNo }),
      });
    } catch (error) {
      console.error("Error marking inquiry as read:", error);
    }
  };

  useEffect(() => {
    if (inquiryNo) {
      fetchInquiryDetails();
      markInquiryRead();
    }
  }, [inquiryNo]);

  const handleGoBack = () => {
    router.push(routes.inquiry);
  };

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading inquiry details..." />
      </DashboardLayoutWrapper>
    );
  }

  if (!inquiry) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex justify-center items-center h-full text-lg text-primary/70">
          Inquiry not found.
        </div>
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {/* Header with Back Button */}
      <div className="flex flex-row justify-between items-center mb-5">
        <CardTitle className="text-4xl">Inquiry Detail</CardTitle>
        <Button variant="outline" onClick={handleGoBack} className="font-normal">
          <MoveLeft className="scale-125" />
          Back to Inquiries
        </Button>
      </div>

      {/* Inquiry Detail Card */}
      <Card className="flex flex-col gap-5 p-6 rounded-lg shadow-md">
        <div className="flex flex-row gap-3 items-center">
          <Label className="font-bold">Email:</Label>
          <span className="text-primary/80">{inquiry.email}</span>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <Label className="font-bold">Subject:</Label>
          <span className="text-primary/80">{inquiry.subject}</span>
        </div>
        <div className="flex flex-col gap-3">
          <Label className="font-bold">Message:</Label>
          <p className="whitespace-pre-line break-words bg-muted p-3 rounded-lg font-light text-primary/80">
            {inquiry.message}
          </p>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <Label className="font-bold">Status:</Label>
          <span className="text-primary/80">{inquiry.read ? "READ" : "Unread"}</span>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <Label className="font-bold">Date:</Label>
          <span className="text-primary/80">{new Date(inquiry.created_at).toLocaleString()}</span>
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
