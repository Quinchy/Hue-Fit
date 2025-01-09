import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import Link from "next/link";
import routes from "@/routes";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Eye, Pencil, Trash2, Search, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";  // Import Skeleton component

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navItems = [
    { label: "Orders", href: routes.order },
    { label: "Reserves", href: routes.orderReserve },
  ];

  const fetchOrders = async (page = 1, searchQuery = "", statusFilter = "") => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/orders/get-orders?page=${page}&search=${searchQuery}&status=${statusFilter}`
      );
      const data = await response.json();
      setOrders(data.orders || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, search, status);
  }, [currentPage, search, status]);

  const handleViewClick = (orderNo) => {
    router.push(`/dashboard/order/view/${orderNo}`);
  };

  const handleEditClick = (orderNo) => {
    router.push(`/dashboard/order/edit/${orderNo}`);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Orders</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search order"
            variant="icon"
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <ChevronDown className="scale-125" />
                Filter by Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                {["Processing", "Preparing", "Packaging"].map((filterStatus) => (
                  <DropdownMenuItem key={filterStatus}>
                    <Button variant="none" onClick={() => setStatus(filterStatus)}>
                      {filterStatus}
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Card className="flex flex-col p-5 gap-4 min-h-[49rem]">
        <DashboardPagesNavigation items={navItems} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[2rem]">Order Number</TableHead>
              <TableHead className="max-w-[2rem]">Product Name</TableHead>
              <TableHead className="max-w-[0.75rem] text-center">Size</TableHead>
              <TableHead className="max-w-[0.75rem] text-center">Quantity</TableHead>
              <TableHead className="max-w-[1rem] text-center">Price</TableHead>
              <TableHead className="max-w-[1rem] text-center">Status</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeletons while loading data
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.orderNo}>
                  <TableCell className="max-w-[2rem]">{order.orderNo}</TableCell>
                  <TableCell className="max-w-[2rem] overflow-hidden whitespace-nowrap text-ellipsis">
                    {order.ProductVariant?.Product?.name || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[0.75rem] text-center">
                    {order.Size?.name || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[0.75rem] text-center">
                    {order.quantity || 0}
                  </TableCell>
                  <TableCell className="max-w-[1rem] text-center">
                    ₱{order.ProductVariant?.price ? parseFloat(order.ProductVariant.price).toFixed(2) : "0.00"}
                  </TableCell>
                  <TableCell className="max-w-[1rem] text-center">
                    <p className="py-1 w-full rounded font-bold text-card bg-yellow-500 uppercase">
                      {order.status}
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
                          <DropdownMenuItem>
                            <Button variant="none" onClick={() => handleViewClick(order.orderNo)}>
                              <Eye className="scale-125 mr-2" />
                              View
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Button variant="none" onClick={() => handleEditClick(order.orderNo)}>
                              <Pencil className="scale-125 mr-2" />
                              Edit
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
                <TableCell colSpan={7} className="text-center align-middle h-[39rem] text-primary/50 text-lg font-thin tracking-wide">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {orders.length > 0 && (
          <Pagination className="flex flex-col items-end">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => setCurrentPage((prev) => prev - 1)} />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => setCurrentPage(page)}>{page}</PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationNext onClick={() => setCurrentPage((prev) => prev + 1)} />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
