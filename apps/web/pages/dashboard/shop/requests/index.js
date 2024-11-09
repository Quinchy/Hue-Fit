import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import DashboardPagesNavigation from "@/components/ui/dashboard-pages-navigation";
import Link from "next/link";
import routes from '@/routes';
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { NotepadText } from 'lucide-react';

export default function ShopRequests() {
  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Shop Requests</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search shop request" variant="icon" icon={Search}/>
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
                    Pending
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">
                    Rejected
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu> 
        </div>
      </div>
      <DashboardPagesNavigation>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.shop}>
          Shops
        </Link>
        <Link className={`${buttonVariants({ variant: "ghost" })} px-5 uppercase text-lg font-semibold`} href={routes.shopRequest}>
          Requests
        </Link>
      </DashboardPagesNavigation>
      <Card className="flex flex-col gap-5 justify-between min-h-[43.75rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1rem]">Request Number</TableHead>
              <TableHead className="max-w-[3rem]">Shop Name</TableHead>
              <TableHead className="max-w-[4rem]">Address</TableHead>
              <TableHead className="max-w-[1rem] text-center">Status</TableHead>
              <TableHead className="max-w-[1rem] text-center" >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="max-w-[1rem] font-medium">Request Number</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden whitespace-nowrap text-ellipsis">Shop Name</TableCell>
              <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">Address</TableCell>
              <TableCell className="max-w-[1rem] text-center">Status</TableCell>
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
                    <DropdownMenuItem className="justify-center">
                      <Button variant="none" className="text-base">
                        <Pencil className="scale-125"/>
                        Manage
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
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Card>
    </DashboardLayoutWrapper>
  );
}
