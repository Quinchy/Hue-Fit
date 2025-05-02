// pages/tags/index.js
import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  MoveLeft,
  ChevronDown,
  Pencil,
  X,
  CheckCircle,
  CircleAlert,
} from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddTagDialog from "@/components/ui/maintenance/tag/add-tag";
import EditTagDialog from "@/components/ui/maintenance/tag/edit-tag";
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
import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Loading = dynamic(
  () => import("@/components/ui/loading"),
  { ssr: false } // ← this is the key
);

const typeColorMap = {
  UPPERWEAR: "bg-blue-500",
  LOWERWEAR: "bg-teal-500",
  FOOTWEAR: "bg-purple-500",
  OUTERWEAR: "bg-cyan-500",
  DEFAULT: "bg-gray-300",
};

const getTypeColorClass = (typeName) => {
  return typeColorMap[typeName?.toUpperCase()] || typeColorMap.DEFAULT;
};

export default function Tags() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [tags, setTags] = useState([]);
  const [types, setTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingNextPage, setLoadingNextPage] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const [alert, setAlert] = useState({ message: "", type: "", title: "" });

  // Fetch tags
  const fetchTags = async (
    page = currentPage,
    search = debouncedSearchTerm
  ) => {
    setLoadingNextPage(true);
    try {
      const response = await fetch(
        `/api/maintenance/tags/get-tags?page=${page}&search=${encodeURIComponent(
          search
        )}`
      );
      const data = await response.json();
      setTags(data.tags || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setInitialLoading(false);
      setLoadingNextPage(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch tags whenever page or debounced search changes
  useEffect(() => {
    fetchTags();
  }, [currentPage, debouncedSearchTerm]);

  // Fetch types once
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/maintenance/types/get-types");
        const data = await response.json();
        setTypes(data.types || []);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };
    fetchTypes();
  }, []);

  const handleAlert = (message, type, title) => {
    setAlert({ message, type, title });
    setTimeout(() => setAlert({ message: "", type: "", title: "" }), 5000);
  };

  const handleEdit = (tag) => {
    const type = types.find(
      (t) => t.name.trim().toUpperCase() === tag.typeName?.trim().toUpperCase()
    );
    const tagWithTypeId = { ...tag, typeId: type ? String(type.id) : "" };
    setSelectedTag(tagWithTypeId);
    setIsEditDialogOpen(true);
  };

  // Refetch tags after adding
  const handleAddTag = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Error");
    if (type === "success") {
      fetchTags(1, debouncedSearchTerm);
    }
  };

  // Refetch tags after updating
  const handleTagUpdated = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Error");
    if (type === "success") {
      fetchTags(1, debouncedSearchTerm);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading tags..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {alert.message && (
        <Alert className="flex flex-row items-center fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
          {alert.type === "success" ? (
            <CheckCircle className="ml-4 scale-[200%] h-[60%] stroke-green-500" />
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
        <CardTitle className="text-4xl">Tags</CardTitle>
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
            placeholder="Search a tag"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddTagDialog
            onTagAdded={(message, type) => handleAddTag(message, type)}
          />
        </div>
      </div>

      <Card className="flex flex-col p-5 gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/12">Name</TableHead>
              <TableHead className="w-full">Assigned To</TableHead>
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
            ) : tags.length > 0 ? (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>
                    {tag.typeName ? (
                      <p
                        className={`py-1 max-w-[7rem] text-center mr-1 rounded font-bold text-white ${getTypeColorClass(
                          tag.typeName
                        )}`}
                      >
                        {tag.typeName}
                      </p>
                    ) : (
                      <span>Unassigned</span>
                    )}
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
                              onClick={() => handleEdit(tag)}
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
                  No tags found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {tags.length > 0 && (
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

      {selectedTag && (
        <EditTagDialog
          tag={selectedTag}
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedTag(null);
            }
          }}
          onTagUpdated={(message, type) => handleTagUpdated(message, type)}
          types={types}
        />
      )}
    </DashboardLayoutWrapper>
  );
}
