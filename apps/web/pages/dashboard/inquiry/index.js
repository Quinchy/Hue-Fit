import React, { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, NotepadText, ChevronDown, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import routes from "@/routes";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Inquiries() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const apiUrl = `/api/inquiry/get-inquiry?page=${currentPage}&limit=8&status=${statusFilter}&search=${encodeURIComponent(
    searchQuery
  )}`;

  const { data, isValidating } = useSWR(apiUrl, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const inquiries = data?.inquiries || [];
  const totalPages = data?.totalPages || 1;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleViewClick = (inquiryNo) => {
    router.push(routes.inquiryView.replace("[inquiryNo]", inquiryNo));
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Inquiries</CardTitle>
        <div className="flex flex-row gap-5">
          <Input
            type="text"
            className="min-w-[30rem]"
            placeholder="Search by email"
            variant="icon"
            icon={Search}
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
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
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" onClick={() => handleStatusFilter("ALL")}>
                    All
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" onClick={() => handleStatusFilter("READ")}>
                    Read
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" onClick={() => handleStatusFilter("UNREAD")}>
                    Unread
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="flex flex-col p-5 gap-4 min-h-[49rem]">
        <div className="flex flex-col gap-4 justify-between min-h-[42rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[7rem]">Email</TableHead>
                <TableHead className="min-w-[7rem]">Subject</TableHead>
                <TableHead className="min-w-[20rem]">Message</TableHead>
                <TableHead className="min-w-[2rem] text-center">Status</TableHead>
                <TableHead className="min-w-[2rem] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!data ? (
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
                  </TableRow>
                ))
              ) : inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="max-w-[5rem] overflow-hidden text-ellipsis">
                      {inquiry.email}
                    </TableCell>
                    <TableCell className="max-w-[5rem] overflow-hidden text-ellipsis">
                      {inquiry.subject}
                    </TableCell>
                    <TableCell className="max-w-[15rem] overflow-hidden whitespace-nowrap text-ellipsis">
                      {inquiry.message}
                    </TableCell>
                    <TableCell className="max-w-[2rem] text-center">
                      <p
                        className={`py-1 w-full rounded font-bold text-card ${
                          inquiry.read ? "bg-slate-500" : "bg-red-500"
                        } uppercase`}
                      >
                        {inquiry.read ? "READ" : "UNREAD"}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[2rem] text-center">
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
                                className="text-base flex items-center"
                                onClick={() => handleViewClick(inquiry.inquiryNo)}
                              >
                                <Eye className="scale-125 mr-2" />
                                View
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
                    className="text-center align-middle h-[39rem] text-primary/50 text-lg font-thin tracking-wide"
                  >
                    No inquiries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {inquiries.length > 0 && (
            <Pagination className="flex flex-col items-end">
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationPrevious onClick={() => setCurrentPage((prev) => prev - 1)} />
                )}
                {Array.from({ length: data?.totalPages || 1 }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => setCurrentPage(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {currentPage < (data?.totalPages || 1) && (
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
