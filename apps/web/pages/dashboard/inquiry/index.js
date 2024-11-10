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
import { Search } from 'lucide-react';
import { NotepadText } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function Inquiries() {
  return (
    <DashboardLayoutWrapper>
      {/* Page Header */}
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Inquiries</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search inquiries" variant="icon" icon={Search} />
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
                    Read
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">
                    Unread
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu> 
        </div>
      </div>

      {/* Inquiries Table */}
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
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
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">Email</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">Subject</TableCell>
              <TableCell className="max-w-[5rem] overflow-hidden text-ellipsis">Message</TableCell>
              <TableCell className="max-w-[2rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-slate-500 uppercase">READ</p>
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
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">Email</TableCell>
              <TableCell className="max-w-[3rem] overflow-hidden text-ellipsis">Subject</TableCell>
              <TableCell className="max-w-[5rem] overflow-hidden text-ellipsis">Message</TableCell>
              <TableCell className="max-w-[2rem] text-center">
                <p className="py-1 w-full  rounded font-bold text-card bg-red-500 uppercase ">Unread</p>
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
