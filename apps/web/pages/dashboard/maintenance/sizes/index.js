import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft, ChevronDown, Pencil, Search } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddSizeDialog from "./components/add-size";
import EditSizeDialog from "./components/edit-size"; // Import the EditSizeDialog
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Sizes() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data, isLoading, mutate } = useSWR(
    `/api/maintenance/sizes/get-sizes?page=${currentPage}&search=${encodeURIComponent(
      debouncedSearchTerm
    )}`,
    fetcher,
    {
      onSuccess: () => {
        setInitialLoading(false);
        setLoadingNextPage(false);
      },
    }
  );

  const handleEdit = (size) => {
    setSelectedSize(size);
    setIsEditDialogOpen(true);
  };

  const handleSizeAdded = () => {
    mutate();
  };

  const handleSizeUpdated = () => {
    mutate();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (data?.totalPages || 1)) {
      setCurrentPage(page);
      setLoadingNextPage(true);
    }
  };

  if (isLoading && initialLoading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading sizes..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Sizes</CardTitle>
        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
            <MoveLeft className="scale-125" />
            Back to Maintenance
          </Button>
          <Input
            type="text"
            className="min-w-[20rem]"
            placeholder="Search a size"
            variant="icon"
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddSizeDialog onSizeAdded={handleSizeAdded} />
        </div>
      </div>
      <Card className="flex flex-col gap-5 p-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/12">Name</TableHead>
              <TableHead className="w-full">Abbreviation</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingNextPage ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-[3.25rem] w-[10rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[3.25rem] w-[10rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[3.25rem] w-[10rem]" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.sizes?.length > 0 ? (
              data.sizes.map((size) => (
                <TableRow key={size.id}>
                  <TableCell>{size.name}</TableCell>
                  <TableCell>{size.abbreviation}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="font-normal flex items-center gap-1"
                        >
                          Action <ChevronDown className="scale-125" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-50">
                        <DropdownMenuGroup>
                          <DropdownMenuItem className="justify-center">
                            <Button
                              variant="none"
                              onClick={() => handleEdit(size)}
                              className="flex items-center gap-2"
                            >
                              <Pencil className="scale-125" />
                              Edit
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
                  colSpan={3}
                  className="text-center align-middle h-[43rem] text-primary/50 text-lg font-thin tracking-wide"
                >
                  No sizes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data?.sizes?.length > 0 && (
          <Pagination className="flex flex-col items-end">
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
      {selectedSize && (
        <EditSizeDialog
          size={selectedSize}
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedSize(null);
            }
          }}
          onSizeUpdated={handleSizeUpdated}
        />
      )}
    </DashboardLayoutWrapper>
  );
}
