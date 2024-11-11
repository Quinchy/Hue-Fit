// components/UsersPage.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import routes from '@/routes';
import { Plus, Eye, Pencil, Trash2, ChevronDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import Image from 'next/image';

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(2); // Set total pages manually for mock data
  const router = useRouter();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewClick = (userNo, role) => {
    // Passing `userNo` and `role` as query parameters to the view route
    router.push({
      pathname: routes.userView.replace("[userNo]", userNo),
      query: { role },
    });
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Users</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search user" variant="icon" icon={Search} />
          <Button href={routes.userAdd}>
            <Plus className="scale-110 stroke-[3px]" />
            Add User
          </Button>
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1rem]">Picture</TableHead>
              <TableHead className="max-w-[3rem]">Name</TableHead>
              <TableHead className="max-w-[3rem]">Username/Email</TableHead>
              <TableHead className="max-w-[1rem] text-center">Role</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Replace hardcoded TableRow items with dynamic data as needed */}
            <TableRow>
              <TableCell className="max-w-[1rem]">
                <Image src="/images/profile-picture.png" alt="Profile" width={60} height={60} className="rounded-full" />
              </TableCell>
              <TableCell className="max-w-[3rem] font-medium">Full Name</TableCell>
              <TableCell className="max-w-[3rem]">
                <div>Username</div>
                <div className="text-primary/55">Email</div>
              </TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-yellow-500 uppercase">ADMIN</p>
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
                          onClick={() => handleViewClick(1, "ADMIN")} // Pass role as "ADMIN"
                        >
                          <Eye className="scale-125"/>
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button
                          variant="none"
                          className="text-base"
                          onClick={() => router.push(routes.userEdit.replace("[userNo]", 1))}
                        >
                          <Pencil className="scale-125"/>
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
            <TableRow>
              <TableCell className="max-w-[1rem]">
                <Image src="/images/profile-picture.png" alt="Profile" width={60} height={60} className="rounded-full" />
              </TableCell>
              <TableCell className="max-w-[3rem] font-medium">Full Name</TableCell>
              <TableCell className="max-w-[3rem]">
                <div>Username</div>
                <div className="text-primary/55">Email</div>
              </TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-purple-500 uppercase">VENDOR</p>
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
                          onClick={() => handleViewClick(1, "VENDOR")} // Pass role as "ADMIN"
                        >
                          <Eye className="scale-125"/>
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button
                          variant="none"
                          className="text-base"
                          onClick={() => router.push(routes.userEdit.replace("[userNo]", 1))}
                        >
                          <Pencil className="scale-125"/>
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
            <TableRow>
              <TableCell className="max-w-[1rem]">
                <Image src="/images/profile-picture.png" alt="Profile" width={60} height={60} className="rounded-full" />
              </TableCell>
              <TableCell className="max-w-[3rem] font-medium">Full Name</TableCell>
              <TableCell className="max-w-[3rem]">
                <div>Username</div>
                <div className="text-primary/55">Email</div>
              </TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-sky-500 uppercase">Customer</p>
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
                          onClick={() => handleViewClick(1, "CUSTOMER")}
                        >
                          <Eye className="scale-125"/>
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button
                          variant="none"
                          className="text-base"
                          onClick={() => router.push(routes.userEdit.replace("[userNo]", 1))}
                        >
                          <Pencil className="scale-125"/>
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
          </TableBody>
        </Table>
        <Pagination className="flex flex-col items-end">
          <PaginationContent>
            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page} active={page === currentPage}>
                <PaginationLink onClick={() => handlePageChange(page)}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </PaginationContent>
        </Pagination>
      </Card>
    </DashboardLayoutWrapper>
  );
}
