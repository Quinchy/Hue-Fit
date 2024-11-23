import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddColorDialog from "./components/add-color";
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Colors() {
  const router = useRouter();
  const [colors, setColors] = useState([]); // Stores the list of colors
  const [loading, setLoading] = useState(true); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  useEffect(() => {
    // Fetch colors from the API
    const fetchColors = async () => {
      try {
        const response = await fetch(`/api/maintenance/colors/get-colors?page=${currentPage}`);
        if (response.ok) {
          const data = await response.json();
          setColors(data.colors); // Assuming API returns { colors: [], totalPages }
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

    fetchColors();
  }, [currentPage]);

  const handleAddColor = (newColor) => {
    // Add the new color to the top of the table
    setColors((prevColors) => [newColor, ...prevColors]);
  };

  const handleEdit = (color) => {
    console.log("Edit color:", color);
    // Add your edit logic here
  };

  const handleDelete = (color) => {
    console.log("Delete color:", color);
    // Add your delete logic here
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
          <AddColorDialog onColorAdded={handleAddColor}/> {/* Pass the handler */}
        </div>
      </div>
      <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color Id</TableHead>
              <TableHead>Color Name</TableHead>
              <TableHead>Hexcode</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24" />
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
                      className="flex items-center gap-2"
                      style={{ color: color.hexcode }}
                    >
                      <span
                        className="w-6 h-6 rounded-full border"
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
        {/* Pagination Controls */}
        <div className="flex justify-end items-center gap-4 p-4">
          <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
