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

export default function Reserves() {
  const navItems = [
    { label: "Orders", href: routes.order },
    { label: "Reserves", href: routes.orderReserve },
  ];

  return (
    <DashboardLayoutWrapper>
      {/* Page Header */}
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Reserved Orders</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search reserved order" variant="icon" icon={Search} />
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
                  <Button variant="none" className="text-base">
                    Reserved
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">
                    Terminated
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu> 
        </div>
      </div>

      {/* Reserves Table */}
      <Card className="flex flex-col p-5 gap-4 min-h-[49rem]">
        <DashboardPagesNavigation items={navItems} />
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[1rem]">Order Number</TableHead>
            <TableHead className="max-w-[3rem]">Product Name</TableHead>
            <TableHead className="max-w-[1rem] text-center">Size</TableHead> {/* Added Size Column */}
            <TableHead className="max-w-[1rem] text-center">Quantity</TableHead>
            <TableHead className="max-w-[1rem] text-center">Price</TableHead>
            <TableHead className="max-w-[1rem] text-center">Status</TableHead>
            <TableHead className="max-w-[1rem] text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="max-w-[1rem]">Order-Number</TableCell>
            <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">Product Name</TableCell>
            <TableCell className="max-w-[1rem] text-center">Medium</TableCell> {/* Added Size Cell */}
            <TableCell className="max-w-[1rem] text-center">Quantity</TableCell>
            <TableCell className="max-w-[1rem] text-center">Price</TableCell>
            <TableCell className="max-w-[1rem] text-center">
              <p className="py-1 w-full rounded font-bold text-card bg-blue-500 uppercase">Reserved</p>
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
          {/* Additional Rows can follow with the "Size" column populated */}
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
