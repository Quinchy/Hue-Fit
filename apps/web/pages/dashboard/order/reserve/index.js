// pages/dashboard/order/reserves.js

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import Link from "next/link";
import routes from "@/routes";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
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
import {
  Pencil,
  Search,
  ChevronDown,
  Wrench,
  CircleOff,
  Copy,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import CancelOrderDialog from "@/components/ui/order/cancel-order-dialog";

export default function Reserves() {
  const router = useRouter();
  const [reserves, setReserves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("RESERVED"); // Default to "RESERVED"
  const [loading, setLoading] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [copiedOrder, setCopiedOrder] = useState(null); // State for tracking copied order number

  const navItems = [
    { label: "Orders", href: routes.order },
    { label: "Reserves", href: routes.orderReserve },
  ];

  const fetchReserves = async (
    page = 1,
    searchQuery = "",
    statusFilter = "RESERVED"
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/orders/get-orders?page=${page}&search=${searchQuery}&status=${statusFilter}`
      );
      const data = await response.json();
      setReserves(data.orders || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching reserves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReserves(currentPage, search, status);
  }, [currentPage, search, status]);

  const handleUpdateClick = (orderNo) => {
    router.push(`/dashboard/order/edit/${orderNo}`);
  };

  const handleStatusFilter = (filterStatus) => {
    setStatus(filterStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCancelConfirm = async (orderId, reason) => {
    try {
      await axios.post("/api/orders/cancel-order", { orderId, reason });
      fetchReserves(currentPage, search, status);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row items-center justify-between">
        <CardTitle className="text-4xl">Reserved Orders</CardTitle>
        <div className="flex flex-row items-center gap-2">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search reserved orders"
            variant="icon"
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link
            className={`${buttonVariants({
              variant: "default",
            })} px-8 align-middle`}
            href={routes.manageFee}
          >
            <Wrench />
            Configuration
          </Link>
        </div>
      </div>

      <Card className="flex flex-col p-5 gap-4 min-h-[49rem]">
        <DashboardPagesNavigation items={navItems} />

        <div className="flex flex-col gap-4 justify-between min-h-[42rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[12%]">Order Number</TableHead>
                <TableHead className="w-[50%]">Product Name</TableHead>
                <TableHead className="w-[8%] text-center">Size</TableHead>
                <TableHead className="w-[5%] text-center">Quantity</TableHead>
                <TableHead className="w-[10%] text-center">Price</TableHead>
                <TableHead className="w-[10%] text-center">Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : reserves.length > 0 ? (
                reserves.map((order) => {
                  const maxItemsToShow = 2;
                  const items = order.OrderItems || [];
                  const limitedItems = items.slice(0, maxItemsToShow);

                  const productNames = limitedItems.map((item) => {
                    const color = item.ProductVariant?.Color?.name || "";
                    const product = item.ProductVariant?.Product?.name || "";
                    return `${color} ${product}`.trim();
                  });

                  const sizes = limitedItems.map(
                    (item) => item.ProductVariantSize?.Size?.name || "N/A"
                  );

                  const quantities = limitedItems.map((item) =>
                    String(item.quantity || 0)
                  );

                  const prices = limitedItems.map((item) => {
                    const p = item.ProductVariant?.price
                      ? parseFloat(item.ProductVariant.price).toFixed(2)
                      : "0.00";
                    return `₱${p}`;
                  });

                  const hasMoreItems = items.length > maxItemsToShow;

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center justify-evenly relative">
                          <span>{order.orderNo}</span>
                          <Button
                            variant="none"
                            onClick={() => {
                              navigator.clipboard.writeText(order.orderNo);
                              setCopiedOrder(order.orderNo);
                              setTimeout(() => setCopiedOrder(null), 1000);
                            }}
                            className="transition-all active:scale-75 hover:opacity-75 duration-300 ease-in-out ml-2"
                          >
                            <Copy className="scale-100" />
                          </Button>
                          <div
                            className={`absolute top-0 right-2 -translate-x-1/2 mt-1 px-2 py-1 bg-primary text-pure rounded shadow text-xs transition-opacity ease-in-out duration-500 ${
                              copiedOrder === order.orderNo
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          >
                            Copied!
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="overflow-hidden whitespace-pre-line">
                        {productNames.length > 0
                          ? productNames.join("\n")
                          : "No items"}
                        {hasMoreItems &&
                          `\n... +${items.length - maxItemsToShow} more`}
                      </TableCell>
                      <TableCell className="text-center whitespace-pre-line">
                        {sizes.join("\n")}
                        {hasMoreItems && "\n..."}
                      </TableCell>
                      <TableCell className="text-center whitespace-pre-line">
                        {quantities.join("\n")}
                        {hasMoreItems && "\n..."}
                      </TableCell>
                      <TableCell className="text-center whitespace-pre-line">
                        {prices.join("\n")}
                        {hasMoreItems && "\n..."}
                      </TableCell>
                      <TableCell className="text-center">
                        <p className="py-1 w-full rounded font-bold uppercase bg-rose-500 text-rose-950">
                          {order.status}
                        </p>
                      </TableCell>
                      <TableCell className="text-center text-red-500/75">
                        <Button
                          variant="destructive"
                          onClick={() => setCancelOrder(order.id)}
                          className="bg-red-500/10 hover:bg-red-500/25 text-red-500 transition-all duration-500 ease-in-out active:scale-90"
                        >
                          <CircleOff className="mr-1" />
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center align-middle h-[39rem] text-primary/50 text-lg font-thin tracking-wide"
                  >
                    No reserved orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {reserves.length > 0 && (
            <Pagination className="flex flex-col items-end">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  />
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page} active={page === currentPage}>
                      <PaginationLink onClick={() => setCurrentPage(page)}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                {currentPage < totalPages && (
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  />
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </Card>
      {cancelOrder && (
        <CancelOrderDialog
          orderNo={cancelOrder}
          open={!!cancelOrder}
          onClose={() => setCancelOrder(null)}
          onConfirm={handleCancelConfirm}
        />
      )}
    </DashboardLayoutWrapper>
  );
}
