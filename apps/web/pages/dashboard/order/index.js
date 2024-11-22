import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
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
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import routes from '@/routes';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Search } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { NotepadText } from 'lucide-react';
import { buttonVariants } from "@/components/ui/button"

export default function Orders() {
  return (
    <DashboardLayoutWrapper>
      {/* Page Header */}
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Orders</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search order" variant="icon" icon={Search} />
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
                  <Button variant="none" className="text-base">
                    Processing
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">
                    Shipping
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">
                    Delivered
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu> 
        </div>
      </div>

      {/* Navigation Tabs */}
      <DashboardPagesNavigation>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.order}>
          Orders
        </Link>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.orderReserve}>
          Reserves
        </Link>
      </DashboardPagesNavigation>

      {/* Orders Table */}
      <Card className="flex flex-col gap-5 justify-between min-h-[43.75rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1rem]">Order Number</TableHead>
              <TableHead className="max-w-[3rem]">Product Name</TableHead>
              <TableHead className="max-w-[1rem] text-center">Quantity</TableHead>
              <TableHead className="max-w-[1rem] text-center">Price</TableHead>
              <TableHead className="max-w-[1rem] text-center">Status</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Sample Static Data Row */}
            <TableRow>
              <TableCell className="max-w-[1rem]">Order-Number</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">Product Name</TableCell>
              <TableCell className="max-w-[1rem] text-center">Quantity</TableCell>
              <TableCell className="max-w-[1rem] text-center">Price</TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-yellow-500 uppercase">Processing</p>
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
                        <Button variant="none" className="text-base">
                          <Eye className="scale-125" />
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button variant="none" className="text-base">
                          <Pencil className="scale-125" />
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
              <TableCell className="max-w-[1rem]">Order-Number</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">Product Name</TableCell>
              <TableCell className="max-w-[1rem] text-center">Quantity</TableCell>
              <TableCell className="max-w-[1rem] text-center">Price</TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-orange-500 uppercase">Shipping</p>
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
                        <Button variant="none" className="text-base">
                          <Eye className="scale-125" />
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button variant="none" className="text-base">
                          <Pencil className="scale-125" />
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
              <TableCell className="max-w-[1rem]">Order-Number</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">Product Name</TableCell>
              <TableCell className="max-w-[1rem] text-center">Quantity</TableCell>
              <TableCell className="max-w-[1rem] text-center">Price</TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-green-500 uppercase">Delivered</p>
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
                        <Button variant="none" className="text-base">
                          <Eye className="scale-125" />
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button variant="none" className="text-base">
                          <Pencil className="scale-125" />
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

        {/* Pagination */}
        <Pagination className="flex flex-col items-end">
          <PaginationContent>
            <PaginationPrevious />
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationEllipsis />
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Card>
    </DashboardLayoutWrapper>
  );
}
