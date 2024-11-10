import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Eye, Trash2, ChevronDown } from 'lucide-react';

export default function Inquiries() {
  return (
    <DashboardLayoutWrapper>
      {/* Page Header */}
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Inquiries</CardTitle>
      </div>

      {/* Inquiries Table */}
      <Card className="flex flex-col gap-5 justify-between min-h-[43.75rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[3rem]">Email</TableHead>
              <TableHead className="max-w-[3rem]">Subject</TableHead>
              <TableHead className="max-w-[5rem]">Message</TableHead>
              <TableHead className="max-w-[2rem] text-center">Status</TableHead>
              <TableHead className="max-w-[2rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Sample Static Data Rows */}
            <TableRow>
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">carlandrei.tallorin@gmail.com</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">Unlock New Potential</TableCell>
              <TableCell className="max-w-[5rem] overflow-hidden text-ellipsis">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed...</TableCell>
              <TableCell className="max-w-[2rem] text-center">
                <Button variant="outline" className="bg-black text-white">Read</Button>
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
                      <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                        <Button variant="none" className="text-base">
                          <Eye className="scale-125" />
                          View
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
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">drix.lpz015@gmail.com</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">Proposal for a Strategic Partnership</TableCell>
              <TableCell className="max-w-[5rem] overflow-hidden text-ellipsis">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed...</TableCell>
              <TableCell className="max-w-[2rem] text-center">
                <Button variant="outline" className="bg-red-500 text-white">Unread</Button>
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
                      <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                        <Button variant="none" className="text-base">
                          <Eye className="scale-125" />
                          View
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
            {/* Additional rows can be added here following the same structure */}
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
