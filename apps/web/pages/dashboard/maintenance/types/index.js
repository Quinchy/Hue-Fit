// pages/types/index.js
import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft, Search, Pencil, ChevronDown, X, CircleCheck, CircleAlert } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddTypeDialog from "./components/add-type";
import EditTypeDialog from "./components/edit-type";
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
  Pagination,
  PaginationPrevious,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Loading from "@/components/ui/loading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Types() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [types, setTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingNextPage, setLoadingNextPage] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", title: "" });

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch types data
  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      setLoadingNextPage(true);
      try {
        const response = await fetch(
          `/api/maintenance/types/get-types?page=${currentPage}&search=${encodeURIComponent(
            debouncedSearchTerm
          )}`
        );
        const data = await response.json();
        setTypes(data.types || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching types:", error);
      } finally {
        setLoading(false);
        setLoadingNextPage(false);
      }
    };

    fetchTypes();
  }, [currentPage, debouncedSearchTerm]);

  const handleEdit = (type) => {
    setSelectedType(type);
    setIsEditDialogOpen(true);
  };

  const handleAlert = (message, type, title) => {
    setAlert({ message, type, title });
    setTimeout(() => setAlert({ message: "", type: "", title: "" }), 5000);
  };

  const handleAddType = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Failed");
    setCurrentPage(1); // Reload data after adding
  };

  const handleTypeUpdated = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Failed");
    setCurrentPage(1); // Reload data after updating
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading types..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {alert.message && (
        <Alert className="fixed z-50 w-[30rem] right-14 bottom-12 flex flex-row items-center shadow-lg rounded-lg p-4">
          {alert.type === "success" ? (
            <CircleCheck className="ml-4 scale-[200%] h-[60%] stroke-green-500" />
          ) : (
            <CircleAlert className="ml-4 scale-[200%] h-[60%] stroke-red-500" />
          )}
          <div className="flex flex-col ml-4">
            <AlertTitle
              className={`text-lg font-bold ${
                alert.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {alert.title}
            </AlertTitle>
            <AlertDescription
              className={`tracking-wide font-light ${
                alert.type === "success" ? "text-green-400" : "text-red-400"
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
        <CardTitle className="text-4xl">Types</CardTitle>
        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
            <MoveLeft className="scale-125" />
            Back to Maintenance
          </Button>
          <Input
            type="text"
            className="min-w-[20rem]"
            placeholder="Search type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddTypeDialog onAdd={(message, type) => handleAddType(message, type)} />
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between p-5 min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-full">Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingNextPage ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-14 w-[70rem]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-14 w-24 text-end" />
                  </TableCell>
                </TableRow>
              ))
            ) : types.length > 0 ? (
              types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="w-[80%]">{type.name.toUpperCase()}</TableCell>
                  <TableCell className="w-[20%]">
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
                              onClick={() => handleEdit(type)}
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
                  colSpan={2}
                  className="text-center align-middle h-[43rem] text-primary/50 text-lg font-thin tracking-wide"
                >
                  No types found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {types.length > 0 && (
          <Pagination className="flex justify-end">
            <PaginationContent>
              {currentPage > 1 && <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => handlePageChange(page)}>{page}</PaginationLink>
                </PaginationItem>
              ))}
              {currentPage < totalPages && <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />}
            </PaginationContent>
          </Pagination>
        )}
      </Card>
      {selectedType && (
        <EditTypeDialog
          type={selectedType}
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedType(null);
            }
          }}
          onEdit={(message, type) => handleTypeUpdated(message, type)}
        />
      )}
    </DashboardLayoutWrapper>
  );
}
