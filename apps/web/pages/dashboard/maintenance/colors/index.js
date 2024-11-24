import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddColorDialog from "./components/add-color";
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
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export default function Colors() {
  const router = useRouter();
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchColors = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/maintenance/colors/get-colors?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setColors(data.colors || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Failed to fetch colors");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors(currentPage);
  }, [currentPage]);

  const handleEdit = (color) => {
    console.log("Edit color:", color);
  };

  const handleDelete = (color) => {
    console.log("Delete color:", color);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddColor = (newColor) => {
    setColors((prevColors) => [newColor, ...prevColors]);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Colors</CardTitle>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
            <MoveLeft className="scale-125" />
            Back to Maintenance
          </Button>
          <AddColorDialog onColorAdded={handleAddColor} />
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color ID</TableHead>
              <TableHead>Color Name</TableHead>
              <TableHead>Hexcode</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-14 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-[30rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-[20rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : colors.length > 0 ? (
              colors.map((color) => (
                <TableRow key={color.id}>
                  <TableCell className="w-[10%]">{color.id}</TableCell>
                  <TableCell className="w-[50%]">{color.name}</TableCell>
                  <TableCell className="w-[30%]">
                    <div
                      className="flex items-center gap-2 text-base font-medium"
                      style={{ color: color.hexcode }}
                    >
                      <span
                        className="w-7 h-7 rounded-sm border-accent border-2"
                        style={{ backgroundColor: color.hexcode }}
                      ></span>
                      {color.hexcode}
                    </div>
                  </TableCell>
                  <TableCell>
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
                              onClick={() => handleEdit(color)}
                            >
                              <Pencil className="scale-125" />
                              Edit
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="justify-center">
                            <Button
                              variant="none"
                              className="font-bold text-red-500"
                              onClick={() => handleDelete(color)}
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
                <TableCell colSpan={4} className="text-center">
                  No colors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {colors.length > 0 && (
          <Pagination className="flex flex-col items-end">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(page)}>{page}</PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && (
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
    </DashboardLayoutWrapper>
  );
}
