import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddTypeDialog from "./components/add-type";
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
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Types() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, mutate } = useSWR(
    `/api/maintenance/types/get-types?page=${currentPage}`,
    fetcher
  );

  const handleAddType = async () => {
    mutate();
  };

  const handleEdit = (type) => {
    console.log("Edit type:", type);
  };

  const handleDelete = async (typeId) => {
    try {
      const response = await fetch(`/api/maintenance/types/delete-type`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: typeId }),
      });

      if (response.ok) {
        mutate();
      } else {
        console.error("Failed to delete type");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (data?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Types</CardTitle>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
            <MoveLeft className="scale-125" />
            Back to Maintenance
          </Button>
          <AddTypeDialog onAdd={handleAddType} />
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-14 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-[70rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-24 text-end" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.types?.length > 0 ? (
              data.types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="w-[10%]">{type.id}</TableCell>
                  <TableCell className="w-[80%]">{type.name.toUpperCase()}</TableCell>
                  <TableCell className="w-[10%]">
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
                            <Button variant="none" onClick={() => handleEdit(type)}>
                              <Pencil className="scale-125" />
                              Edit
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="justify-center">
                            <Button
                              variant="none"
                              className="font-bold text-red-500"
                              onClick={() => handleDelete(type.id)}
                            >
                              <Trash2 className="scale-125 stroke-red-500" />
                              Delete
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
                <TableCell colSpan={3} className="text-center">
                  No types found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data?.types?.length > 0 && (
          <Pagination className="flex justify-end">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
              )}
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(page)}>{page}</PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < data.totalPages && (
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
