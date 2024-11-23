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
import { useEffect, useState } from "react";

export default function Types() {
  const router = useRouter();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTypes = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/maintenance/types/get-types?page=${page}`);
      if (response.ok) {
        const data = await response.json();
        setTypes(data.types);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      } else {
        console.error("Failed to fetch types");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes(currentPage);
  }, [currentPage]);

  const handleAddType = async () => {
    fetchTypes(currentPage); // Refresh the table dynamically after adding a type
  };

  const handleEdit = (type) => {
    console.log("Edit type:", type);
    // Add your edit logic here
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
        setTypes((prevTypes) => prevTypes.filter((type) => type.id !== typeId));
      } else {
        console.error("Failed to delete type");
      }
    } catch (error) {
      console.error("An error occurred:", error);
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
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : types.length > 0 ? (
              types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="w-[40%]">{type.id}</TableCell>
                  <TableCell className="w-[40%]">{type.name.toUpperCase()}</TableCell>
                  <TableCell className="w-[30%]">
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
                            >
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
