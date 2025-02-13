import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import routes from "@/routes";

const fetcher = (url) => fetch(url).then((res) => res.json());

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const seconds = diff / 1000;
  if (seconds < 60) return "Just Now";
  const minutes = seconds / 60;
  if (minutes < 60) {
    const m = Math.floor(minutes);
    return `Last ${m} minute${m > 1 ? "s" : ""} ago`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    const h = Math.floor(hours);
    return `Last ${h} hour${h > 1 ? "s" : ""} ago`;
  }
  const days = hours / 24;
  if (days < 7) {
    const d = Math.floor(days);
    return `Last ${d} day${d > 1 ? "s" : ""} ago`;
  }
  const weeks = days / 7;
  if (days < 365) {
    const w = Math.floor(weeks);
    return `Last ${w} week${w > 1 ? "s" : ""} ago`;
  }
  const years = days / 365;
  const y = Math.floor(years);
  return `Last ${y} year${y > 1 ? "s" : ""} ago`;
}

export default function VendorNotification() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    `/api/notification/get-all-vendor-notifs?page=${currentPage}`,
    fetcher
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (data?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Notification</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.dashboard)}>
          <MoveLeft className="scale-125" />
          Back to Dashboard
        </Button>
      </div>
      <Card className="flex flex-col p-5 gap-5 min-h-[47rem] justify-between">
        <div className="flex flex-col gap-2">
          {isLoading || !data ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col p-2 border-l-4 bg-muted rounded-lg"
              >
                <Skeleton className="w-1/3 h-7 mb-2" />
                <Skeleton className="w-2/3 h-10 mb-2" />
              </div>
            ))
          ) : data.notifications.length === 0 ? (
            <p className="text-lg font-extralight text-center text-primary/50">
              No notifications
            </p>
          ) : (
            data.notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col p-2 border-l-4 bg-muted rounded-lg"
              >
                <div className="flex flex-col items-start gap-2 ml-1">
                  <p className="text-base uppercase font-bold">
                    {notification.title}
                  </p>
                  <p className="text-base font-extralight">
                    {notification.message}
                  </p>
                </div>
                <p className="font-thin text-sm text-primary/50 text-end">
                  {formatRelativeTime(notification.created_at)}
                </p>
              </div>
            ))
          )}
        </div>
        {data && data.notifications.length > 0 && (
          <Pagination className="flex flex-col items-end">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              )}
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              {currentPage < data.totalPages && (
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
