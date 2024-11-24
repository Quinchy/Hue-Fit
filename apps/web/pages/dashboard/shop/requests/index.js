import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import Link from "next/link";
import routes from '@/routes';
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, NotepadText } from 'lucide-react';
import { MailCheck,  MailMinus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ShopRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING"); 
  const router = useRouter();
  const { alert } = router.query; // Read the alert query parameter
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (alert) {
      setShowAlert(true);

      // Automatically hide the alert after 5 seconds
      const timeout = setTimeout(() => {
        setShowAlert(false);
        router.replace(routes.shopRequest, undefined, { shallow: true }); // Remove query parameter
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [alert, router]);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/shop-requests/get-shop-requests?page=${currentPage}&status=${statusFilter}`);
        const data = await response.json();
        setRequests(data.requests || []); // Ensure requests is always an array
        setTotalPages(data.totalPages || 1); // Default to at least 1 page
        setCurrentPage(data.currentPage || 1); // Default to at least 1 page
      } catch (error) {
        console.error("Error fetching shop requests:", error);
      }
      setLoading(false);
    };
  
    fetchRequests();
  }, [currentPage, statusFilter]);
  

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleManageClick = (requestNo) => {
    router.push(routes.shopRequestManage.replace("[requestNo]", requestNo));
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "REJECTED":
        return "bg-red-500";
      case "DONE":
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };
  
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status); // Update the filter state
    setCurrentPage(1); // Reset to the first page for a new filter
  };

  return (
    <DashboardLayoutWrapper>
      {showAlert && (
        <Alert
          className="fixed z-50 w-[30rem] right-10 bottom-10 flex items-center shadow-accent shadow-lg rounded-lg"
        >
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
          <Input type="text" className="min-w-[30rem]" placeholder="Search shop request" variant="icon" icon={Search} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                Filter by Status 
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("PENDING")} className="justify-center uppercase text-base tracking-wide font-semibold">
                  PENDING
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("DONE")} className="justify-center uppercase text-base tracking-wide font-semibold">
                  DONE
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu> 
        </div>
      </div>
      <DashboardPagesNavigation>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.shop}>
          Shops
        </Link>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.shopRequest}>
          Requests
        </Link>
      </DashboardPagesNavigation>
      <Card className="flex flex-col gap-5 justify-between min-h-[43.75rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1.2rem]">Request Number</TableHead>
              <TableHead className="max-w-[3rem]">Shop Name</TableHead>
              <TableHead className="max-w-[4rem]">Address</TableHead>
              <TableHead className="max-w-[1rem] text-center">Status</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-14 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-14 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-14 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-14 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-14 w-full" /></TableCell>
                </TableRow>
              ))
            ) : requests && requests.length > 0 ? (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="max-w-[1.2rem] font-medium">{request.requestNo}</TableCell>
                  <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">{request.shopName}</TableCell>
                  <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">
                    {request.address} {/* Use the full address string from the API */}
                  </TableCell>
                  <TableCell className="max-w-[1rem] text-center">
                    <p className={`py-1 w-full rounded font-bold text-card ${getStatusBgColor(request.status)}`}>{request.status}</p>
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
                          <DropdownMenuItem className="justify-center">
                            <Button variant="none" className="font-bold text-base text-red-500">
                              <Trash2 className="scale-125 stroke-red-500" />
                              Delete
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu> 
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center align-middle h-[30rem] text-primary/50 text-lg font-thin tracking-wide">
                  There are no shop-partnership requests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination className="flex flex-col items-end">
          <PaginationContent>
            {/* Previous button, disabled on the first page */}
            {currentPage > 1 && (
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
              />
            )}

            {/* Page numbers with ellipsis */}
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              // Always show the first, last, and current page, along with pages adjacent to the current page
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
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
              }

              // Show ellipsis when necessary
              if (
                (page === currentPage - 2 && currentPage > 3) || 
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={page} disabled>
                    <span className="px-2">...</span>
                  </PaginationItem>
                );
              }

              return null; // Skip other pages
            })}

            {/* Next button, disabled on the last page */}
            {currentPage < totalPages && (
              <PaginationNext
                href="#"
                onClick={() => handlePageChange(currentPage + 1)}
              />
            )}
          </PaginationContent>
        </Pagination>
      </Card>
    </DashboardLayoutWrapper>
  );
}
