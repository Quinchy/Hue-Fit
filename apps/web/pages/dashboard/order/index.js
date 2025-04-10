// pages/dashboard/order/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import routes from "@/routes";
import { Button, buttonVariants } from "@/components/ui/button";
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
import Link from "next/link";
import CancelOrderDialog from "@/components/ui/order/cancel-order-dialog";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Orders() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [cancelOrder, setCancelOrder] = useState(null);
  const [copiedOrder, setCopiedOrder] = useState(null); // Tracks which order was copied

  const navItems = [
    { label: "Orders", href: routes.order },
    { label: "Reserves", href: routes.orderReserve },
  ];

  const statusColors = {
    PENDING: "bg-blue-400 text-blue-950",
    PROCESSING: "bg-amber-500 text-amber-950",
    DELIVERING: "bg-purple-400 text-purple-950",
    COMPLETED: "bg-green-400 text-green-950",
    CANCELLED: "bg-red-500 text-red-950",
  };

  const { data, isLoading } = useSWR(
    `/api/orders/get-orders?page=${currentPage}&search=${search}&status=${status}`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const statusCountMap = data?.statusCountMap || {};

  useEffect(() => {
    if (data) {
      console.log("Received orders data:", data);
    }
  }, [data]);

  const orderPriority = {
    PENDING: 1,
    PROCESSING: 2,
    DELIVERING: 3,
    COMPLETED: 4,
    CANCELLED: 5,
  };

  const orders = (data?.orders || []).slice().sort((a, b) => {
    const aPriority = orderPriority[a.status.toUpperCase()] || 99;
    const bPriority = orderPriority[b.status.toUpperCase()] || 99;
    return aPriority - bPriority;
  });
  const totalPages = data?.totalPages || 1;

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
      // Optionally refetch data after cancellation
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Orders</CardTitle>
        <div className="flex flex-row items-center gap-2">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search order"
            variant="icon"
            icon={Search}
            value={search}
            onChange={handleSearchChange}
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
                {[
                  "PENDING",
                  "PROCESSING",
                  "DELIVERING",
                  "COMPLETED",
                  "CANCELLED",
                ].map((filterStatus) => (
                  <DropdownMenuItem
                    key={filterStatus}
                    className="justify-center"
                  >
                    <Button
                      variant="none"
                      onClick={() => handleStatusFilter(filterStatus)}
                    >
                      {filterStatus} ({statusCountMap[filterStatus] || 0})
                    </Button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <TableHead className="w-[14%]">Order Number</TableHead>
                <TableHead className="w-[50%]">Product Name</TableHead>
                <TableHead className="w-[8%] text-center">Size</TableHead>
                <TableHead className="w-[5%] text-center">Quantity</TableHead>
                <TableHead className="w-[10%] text-center">Price</TableHead>
                <TableHead className="w-[12%] text-center">Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
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
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  // Prepare product details for the order
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
                    return `PHP ${p}`;
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
                        <p
                          className={`py-1 w-full rounded font-bold uppercase text-white ${
                            statusColors[order.status.toUpperCase()] ||
                            "bg-gray-500"
                          }`}
                        >
                          {order.status}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="font-normal">
                              Action
                              <ChevronDown className="scale-125" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-20">
                            <DropdownMenuGroup>
                              <DropdownMenuItem className="justify-center">
                                <Button
                                  variant="none"
                                  onClick={() =>
                                    handleUpdateClick(order.orderNo)
                                  }
                                >
                                  <Pencil className="mr-1" />
                                  Update
                                </Button>
                              </DropdownMenuItem>
                              {!["CANCELLED", "COMPLETED"].includes(
                                order.status.toUpperCase()
                              ) && (
                                <DropdownMenuItem className="justify-center text-red-500 focus:bg-red-500/25">
                                  <Button
                                    variant="none"
                                    onClick={() => setCancelOrder(order.id)}
                                  >
                                    <CircleOff className="mr-1" />
                                    Cancel
                                  </Button>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
