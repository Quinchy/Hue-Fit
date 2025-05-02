// pages/colors/index.js
import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddColorDialog from "@/components/ui/maintenance/color/add-color";
import EditColorDialog from "@/components/ui/maintenance/color/edit-color";
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
import {
  MoveLeft,
  ChevronDown,
  Pencil,
  X,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import {
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Loading = dynamic(
  () => import("@/components/ui/loading"),
  { ssr: false }
);

export default function Colors() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [colors, setColors] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", title: "" });

  const fetchColors = async (
    page = currentPage,
    search = debouncedSearchTerm
  ) => {
    setLoadingNextPage(true);
    try {
      const response = await fetch(
        `/api/maintenance/colors/get-colors?page=${page}&search=${encodeURIComponent(
          search
        )}`
      );
      const data = await response.json();
      setColors(data.colors || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching colors:", error);
    } finally {
      setInitialLoading(false);
      setLoadingNextPage(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchColors();
  }, [currentPage, debouncedSearchTerm]);

  const handleAlert = (message, type, title) => {
    setAlert({ message, type, title });
    setTimeout(() => setAlert({ message: "", type: "", title: "" }), 5000);
  };

  const handleAddColor = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Failed");
    if (type === "success") {
      fetchColors();
    }
  };

  const handleColorUpdated = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Failed");
    if (type === "success") {
      fetchColors();
    }
  };

  const handleEdit = (color) => {
    setSelectedColor(color);
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading colors..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {alert.message && (
        <Alert className="flex flex-row items-center fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
          {alert.type === "success" ? (
            <CircleCheck className="ml-4 scale-[200%] h-[60%] stroke-green-500" />
          ) : (
            <CircleAlert className="ml-4 scale-[200%] h-[60%] stroke-red-500" />
          )}
          <div className="flex flex-col justify-center ml-10">
            <AlertTitle
              className={`text-lg font-bold ${
                alert.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {alert.title}
            </AlertTitle>
            <AlertDescription
              className={`tracking-wide font-light ${
                alert.type === "success" ? "text-green-300" : "text-red-300"
              }`}
            >
              {alert.message}
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto p-2"
            onClick={() => setAlert({ message: "", type: "", title: "" })}
          >
            <X className="scale-150 stroke-primary/50 -translate-x-2" />
          </Button>
        </Alert>
      )}
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Colors</CardTitle>
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            onClick={() => router.push(routes.maintenance)}
          >
            <MoveLeft className="scale-125" />
            Back to Maintenance
          </Button>
          <Input
            type="text"
            className="min-w-[20rem]"
            placeholder="Search color"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddColorDialog onColorAdded={handleAddColor} />
        </div>
      </div>
      <Card className="flex flex-col p-5 gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/12">Color Name</TableHead>
              <TableHead className="w-10/12">Hexcode</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingNextPage ? (
              Array.from({ length: 13 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-[2.5rem] w-[10rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[2.5rem] w-[10rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[2.5rem] w-[10rem]" />
                  </TableCell>
                </TableRow>
              ))
            ) : colors.length > 0 ? (
              colors.map((color) => (
                <TableRow key={color.id}>
                  <TableCell>{color.name}</TableCell>
                  <TableCell>
                    <div
                      className="flex items-center gap-2 text-base font-medium"
                      style={{ color: color.hexcode }}
                    >
                      <span
                        className="w-7 h-7 rounded-sm"
                        style={{ backgroundColor: color.hexcode }}
                      ></span>
                      {color.hexcode}
                    </div>
                  </TableCell>
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
                              onClick={() => handleEdit(color)}
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
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              {currentPage < totalPages && (
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              )}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
      {selectedColor && (
        <EditColorDialog
          color={selectedColor}
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedColor(null);
            }
          }}
          onColorUpdated={handleColorUpdated}
        />
      )}
    </DashboardLayoutWrapper>
  );
}
