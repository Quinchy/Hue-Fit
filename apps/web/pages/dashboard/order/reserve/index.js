// pages/dashboard/order/reserves.js

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
import { Pencil, Search, ChevronDown, Wrench } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function Reserves() {
  const router = useRouter();
  const [reserves, setReserves] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("RESERVED"); // Default to "RESERVED"
  const [loading, setLoading] = useState(false);

  const navItems = [
    { label: "Orders", href: routes.order },
    { label: "Reserves", href: routes.orderReserve },
  ];

  const fetchReserves = async (page = 1, searchQuery = "", statusFilter = "RESERVED") => {
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

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Reserved Orders</CardTitle>
        <div className="flex flex-row gap-5">
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
            className={`${buttonVariants({ variant: "default" })} px-8 align-middle`}
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
                <TableHead>Order Number</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-center">Size</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Price</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
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

                  const quantities = limitedItems.map(
                    (item) => String(item.quantity || 0)
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
                      <TableCell>{order.orderNo}</TableCell>

                      <TableCell className="overflow-hidden whitespace-pre-line">
                        {productNames.length > 0 ? productNames.join("\n") : "No items"}
                        {hasMoreItems && `\n... +${items.length - maxItemsToShow} more`}
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
                        <p className="py-1 w-full rounded font-bold text-card bg-blue-500 uppercase">
                          {order.status}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
                  <PaginationPrevious onClick={() => setCurrentPage((prev) => prev - 1)} />
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage < totalPages && (
                  <PaginationNext onClick={() => setCurrentPage((prev) => prev + 1)} />
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
