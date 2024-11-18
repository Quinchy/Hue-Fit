import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import routes from '@/routes';
import { Plus } from 'lucide-react';
import { Eye, Pencil, Trash2, ChevronDown } from 'lucide-react';
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
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { NotepadText } from 'lucide-react';

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(2); // Set total pages manually for mock data
  const router = useRouter();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewClick = () => {
    router.push(routes.productView.replace("[productNo]", "001"));
  };

  const handleEditClick = () => {
    router.push(routes.productEdit.replace("[productNo]", "001"));
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-row justify-between">
        <CardTitle className="text-4xl">Products</CardTitle>
        <div className="flex flex-row gap-5">
          <Input type="text" className="min-w-[30rem]" placeholder="Search inquiries" variant="icon" icon={Search} />
          <Link className={buttonVariants({ variant: "default" })} href={routes.productAdd}>
              <Plus className="scale-110 stroke-[3px]" />
              Add Product
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-normal">
                <NotepadText className="scale-125" />
                Filter by Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem className="justify-center uppercase text-base tracking-wide font-semibold">
                  <Button variant="none" className="text-base">
                    Upper Wear
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">
                    Lower Wear
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center">
                  <Button variant="none" className="text-base">
                    Foot Wear
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu> 
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[1rem]">Product Number</TableHead>
              <TableHead className="max-w-[4rem]">Product Name</TableHead>
              <TableHead className="max-w-[1rem] text-center">Quantity</TableHead>
              <TableHead className="max-w-[1rem] text-center">Type</TableHead>
              <TableHead className="max-w-[1rem] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="max-w-[1rem]">Product-Number</TableCell>
              <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">Product Name</TableCell>
              <TableCell className="max-w-[1rem] text-center">Quantity</TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-blue-500 uppercase">Upper Wear</p>
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
                        <Button variant="none" className="text-base" onClick={handleViewClick}>
                          <Eye className="scale-125" />
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button variant="none" className="text-base" onClick={handleEditClick}>
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
              <TableCell className="max-w-[1rem]">Product-Number</TableCell>
              <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">Product Name</TableCell>
              <TableCell className="max-w-[1rem] text-center">Quantity</TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-teal-500 uppercase">Lower Wear</p>
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
                        <Button variant="none" className="text-base" onClick={handleViewClick}>
                          <Eye className="scale-125" />
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button variant="none" className="text-base" onClick={handleEditClick}>
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
              <TableCell className="max-w-[1rem]">Product-Number</TableCell>
              <TableCell className="max-w-[4rem] overflow-hidden whitespace-nowrap text-ellipsis">Product Name</TableCell>
              <TableCell className="max-w-[1rem] text-center">Quantity</TableCell>
              <TableCell className="max-w-[1rem] text-center">
                <p className="py-1 w-full rounded font-bold text-card bg-purple-500 uppercase">Foot Wear</p>
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
                        <Button variant="none" className="text-base" onClick={handleViewClick}>
                          <Eye className="scale-125" />
                          View
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="justify-center">
                        <Button variant="none" className="text-base" onClick={handleEditClick}>
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
