import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddCategoryDialog from "./components/add-category";
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/maintenance/categories/get-categories?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories); // Assuming API returns { categories: [] }
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const handleAddCategory = async () => {
    fetchCategories(currentPage); // Refresh the table after adding a category
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Categories</CardTitle>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(routes.maintenance)}
          >
            <MoveLeft className="scale-125" />
            Back to Maintenance
          </Button>
          <AddCategoryDialog onAdd={handleAddCategory} />
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-[30%]">Category ID</TableHead>
              <TableHead className="text-left w-[50%]">Category Name</TableHead>
              <TableHead className="text-left w-[20%]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-left">{category.id}</TableCell>
                  <TableCell className="text-left">{category.name}</TableCell>
                  <TableCell className="text-left">
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
                              onClick={() =>
                                console.log("Edit category:", category)
                              }
                            >
                              <Pencil className="scale-125" />
                              Edit
                            </Button>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="justify-center">
                            <Button
                              variant="none"
                              className="font-bold text-red-500"
                              onClick={() =>
                                console.log("Delete category:", category)
                              }
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
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
