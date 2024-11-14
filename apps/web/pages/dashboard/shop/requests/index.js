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

export default function ShopRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING"); 
  const router = useRouter();

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
                <TableCell colSpan={5} className="text-center py-5">
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

            {/* Page numbers */}
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  isActive={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

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
