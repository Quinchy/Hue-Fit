import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import routes from "@/routes";
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
import { Pencil, Search, ChevronDown, Wrench, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

// A simple fetcher function that returns JSON
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Orders() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const navItems = [
    { label: "Orders", href: routes.order },
    { label: "Reserves", href: routes.orderReserve },
  ];

  // Define status color mapping using shadcn colors
  const statusColors = {
    PENDING: "bg-blue-400",
    PROCESSING: "bg-amber-500",
    DELIVERING: "bg-purple-400",
    COMPLETED: "bg-green-400",
    CANCELLED: "bg-red-500",
  };

  // Use SWR to fetch orders.
  const { data, isLoading } = useSWR(
    `/api/orders/get-orders?page=${currentPage}&search=${search}&status=${status}`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // Fallbacks
  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  // Sort orders: for example, pending orders come first and completed orders last.
  const sortedOrders = orders.slice().sort((a, b) => {
    // Define custom ordering: lower number means higher priority in the list.
    const orderPriority = {
      PENDING: 1,
      PROCESSING: 2,
      DELIVERING: 3,
      COMPLETED: 4,
      CANCELLED: 5,
    };

    const aPriority = orderPriority[a.status.toUpperCase()] || 99;
    const bPriority = orderPriority[b.status.toUpperCase()] || 99;
    return aPriority - bPriority;
  });

  const handleUpdateClick = (orderNo) => {
    router.push(`/dashboard/order/edit/${orderNo}`);
  };

  const handleStatusFilter = (filterStatus) => {
    setStatus(filterStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
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
                <DropdownMenuItem key="All" className="justify-center">
                  <Button variant="none" onClick={() => handleStatusFilter("")}>
                    All Status
                  </Button>
                </DropdownMenuItem>
                {["PENDING", "PROCESSING", "DELIVERING", "COMPLETED", "CANCELLED"].map(
                  (filterStatus) => (
                    <DropdownMenuItem className="justify-center" key={filterStatus}>
                      <Button
                        variant="none"
                        onClick={() => handleStatusFilter(filterStatus)}
                      >
                        {filterStatus}
                      </Button>
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
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
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
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
              ) : sortedOrders.length > 0 ? (
                sortedOrders.map((order) => {
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
                    return `PHP ${p}`;
                  });

                  const hasMoreItems = items.length > maxItemsToShow;

                  return (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNo}</TableCell>
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
                            statusColors[order.status.toUpperCase()] || "bg-gray-500"
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
                          <DropdownMenuContent className="w-40">
                            <DropdownMenuGroup>
                              <DropdownMenuItem className="justify-center">
                                <Button
                                  variant="none"
                                  onClick={() => handleUpdateClick(order.orderNo)}
                                >
                                  <Pencil className="scale-125 mr-2" />
                                  Update
                                </Button>
                              </DropdownMenuItem>
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
