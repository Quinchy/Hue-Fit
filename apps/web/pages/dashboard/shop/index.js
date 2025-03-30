// 1) pages/dashboard/shop/index.js
import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
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
import { Eye, Search, ChevronDown, Lock, Unlock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotepadText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import routes from "@/routes";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Shop() {
  const router = useRouter();
  const navItems = [
    { label: "Shops", href: routes.shop },
    { label: "Requests", href: routes.shopRequest },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const apiUrl = `/api/shops/get-shops?page=${currentPage}&limit=7&status=${statusFilter}&search=${encodeURIComponent(
    searchQuery
  )}`;

  const { data } = useSWR(apiUrl, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const shops = data?.shops || [];
  const totalPages = data?.totalPages || 1;

  const handleViewClick = (shopNo) => {
    router.push(routes.shopView.replace("[shopNo]", shopNo));
  };

  const handleOpenClick = async (shopNo) => {
    await updateShopStatus(shopNo, "ACTIVE");
  };

  const handleCloseClick = async (shopNo) => {
    await updateShopStatus(shopNo, "INACTIVE");
  };

  const updateShopStatus = async (shopNo, status) => {
    try {
      const response = await fetch("/api/shops/manage-shop-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopNo, status }),
      });
      if (!response.ok) {
        console.error("Error updating shop status");
      }
    } catch (error) {
      console.error("Error updating shop status:", error);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Shops</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search by shop name or shop number"
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
                <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                  <Button
                    variant="none"
                    className="text-base"
                    onClick={() => handleStatusFilter("ALL")}
                  >
                    All
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                  <Button
                    variant="none"
                    className="text-base"
                    onClick={() => handleStatusFilter("ACTIVE")}
                  >
                    Active
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button
                    variant="none"
                    className="text-base"
                    onClick={() => handleStatusFilter("INACTIVE")}
                  >
                    Inactive
                  </Button>
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
                <TableHead className="max-w-[1rem]">Shop Number</TableHead>
                <TableHead className="max-w-[3rem]">Shop Name</TableHead>
                <TableHead className="max-w-[4rem]">Address</TableHead>
                <TableHead className="max-w-[1rem] text-center">Status</TableHead>
                <TableHead className="max-w-[1rem] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data ? (
                Array.from({ length: 12 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-[1rem]">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="max-w-[3rem]">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="max-w-[4rem]">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="max-w-[1rem] text-center">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="max-w-[1rem] text-center">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : shops.length > 0 ? (
                shops.map((shop) => (
                  <TableRow key={shop.shopNo}>
                    <TableCell className="max-w-[1rem] font-medium">
                      {shop.shopNo}
                    </TableCell>
                    <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">
                      {shop.name}
                    </TableCell>
                    <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">
                      {`${shop.ShopAddress.buildingNo} ${shop.ShopAddress.street} ${shop.ShopAddress.barangay}, ${shop.ShopAddress.municipality}, ${shop.ShopAddress.province}, ${shop.ShopAddress.postalCode}`}
                    </TableCell>
                    <TableCell className="max-w-[1rem] text-center">
                      <p
                        className={`py-1 w-full rounded font-bold text-card ${
                          shop.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                        } uppercase`}
                      >
                        {shop.status}
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
                            <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                              <Button
                                variant="none"
                                className="text-base"
                                onClick={() => handleViewClick(shop.shopNo)}
                              >
                                <Eye className="scale-125 mr-2" />
                                View
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button
                                variant="none"
                                className="text-base flex items-center"
                                disabled={shop.status === "ACTIVE"}
                                onClick={() => handleOpenClick(shop.shopNo)}
                              >
                                <Unlock className="scale-125 mr-2" />
                                Open
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button
                                variant="none"
                                className="font-bold text-base text-red-500 flex items-center"
                                disabled={shop.status === "INACTIVE"}
                                onClick={() => handleCloseClick(shop.shopNo)}
                              >
                                <Lock className="scale-125 mr-2" />
                                Close
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
                  <TableCell
                    colSpan={5}
                    className="text-center align-middle h-[40rem] text-primary/50 text-lg font-thin tracking-wide"
                  >
                    There are no partnered shop yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {shops.length > 0 && (
            <Pagination className="flex flex-col items-end">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationPrevious onClick={() => setCurrentPage(currentPage - 1)} />
                )}
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={index + 1 === currentPage}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage < totalPages && (
                  <PaginationNext
                    href="#"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
