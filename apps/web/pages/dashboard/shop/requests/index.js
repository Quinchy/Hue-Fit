// 3) pages/dashboard/shop/requests/index.js
import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronDown, NotepadText, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import routes from "@/routes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck, MailMinus } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ShopRequests() {
  const router = useRouter();
  const navItems = [
    { label: "Shops", href: routes.shop },
    { label: "Requests", href: routes.shopRequest },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const { alert } = router.query;
  const [showAlert, setShowAlert] = useState(Boolean(alert));

  const apiUrl = `/api/shop-requests/get-shop-requests?page=${currentPage}&status=${statusFilter}&search=${encodeURIComponent(
    searchQuery
  )}`;

  const { data, isValidating } = useSWR(apiUrl, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const requests = data?.requests || [];
  const totalPages = data?.totalPages || 1;

  React.useEffect(() => {
    if (alert) {
      setShowAlert(true);
      const timeout = setTimeout(() => {
        setShowAlert(false);
        router.replace(routes.shopRequest, undefined, { shallow: true });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [alert, router]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleManageClick = (requestNo) => {
    router.push(routes.shopRequestManage.replace("[requestNo]", requestNo));
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <DashboardLayoutWrapper>
      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] right-10 bottom-10 flex items-center shadow-accent shadow-lg rounded-lg">
          {alert === "accepted" ? (
            <>
              <MailCheck className="h-10 w-10 stroke-green-500" />
              <div className="ml-7">
                <AlertTitle className="text-green-500 text-base font-semibold">
                  Request Accepted
                </AlertTitle>
                <AlertDescription className="text-green-400">
                  The shop request has been successfully accepted.
                </AlertDescription>
              </div>
            </>
          ) : (
            <>
              <MailMinus className="h-10 w-10 stroke-red-500" />
              <div className="ml-7">
                <AlertTitle className="text-red-500 text-base font-semibold">
                  Request Rejected
                </AlertTitle>
                <AlertDescription className="text-red-400">
                  The shop request has been successfully rejected.
                </AlertDescription>
              </div>
            </>
          )}
          <button
            className="ml-auto mr-4 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}

      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Shop Requests</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search by shop name or request number"
            variant="icon"
            icon={Search}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                Filter by Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleStatusFilterChange("PENDING")}
                  className="justify-center uppercase text-base tracking-wide font-semibold"
                >
                  PENDING
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusFilterChange("DONE")}
                  className="justify-center uppercase text-base tracking-wide font-semibold"
                >
                  DONE
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusFilterChange("REJECTED")}
                  className="justify-center uppercase text-base tracking-wide font-semibold"
                >
                  REJECTED
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="flex flex-col p-5 gap-4 min-h-[49rem]">
        <DashboardPagesNavigation items={navItems} />
        <div className="flex flex-col justify-between min-h-[42rem] gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[1.2rem]">Request Number</TableHead>
                <TableHead className="max-w-[2rem]">Shop Name</TableHead>
                <TableHead className="min-w-[7rem]">Address</TableHead>
                <TableHead className="max-w-[1rem] text-center">Status</TableHead>
                <TableHead className="max-w-[1rem] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data ? (
                // No data available yet, show skeletons (initial loading state)
                Array.from({ length: 12 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : requests.length > 0 ? (
                // Data available: render the actual requests
                requests.map((request) => (
                  <TableRow key={request.requestNo}>
                    <TableCell className="max-w-[1.2rem] font-medium">
                      {request.requestNo}
                    </TableCell>
                    <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">
                      {request.shopName}
                    </TableCell>
                    <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">
                      {request.address}
                    </TableCell>
                    <TableCell className="max-w-[1rem] text-center">
                      <p
                        className={`py-1 w-full rounded font-bold text-card ${
                          request.status === "PENDING"
                            ? "bg-yellow-500"
                            : request.status === "REJECTED"
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      >
                        {request.status}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[1rem] text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="font-normal">
                            Action
                            <ChevronDown className="scale-125" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-50">
                          <DropdownMenuGroup>
                            <DropdownMenuItem className="justify-center">
                              <Button
                                variant="none"
                                className="text-base"
                                onClick={() => handleManageClick(request.requestNo)}
                              >
                                <Pencil className="scale-125" />
                                Manage
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Data fetched but the list is empty
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center align-middle h-[40rem] text-primary/50 text-lg font-thin tracking-wide"
                  >
                    There are no shop requests yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {requests.length > 0 && (
            <Pagination className="flex flex-col items-end">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                )}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {currentPage < totalPages && (
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
