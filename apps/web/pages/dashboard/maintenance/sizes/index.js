import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddSizeDialog from "./components/add-size";
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

export default function Sizes() {
  const router = useRouter();
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sizes from the API
    const fetchSizes = async () => {
      try {
        const response = await fetch("/api/maintenance/sizes/get-sizes");
        if (response.ok) {
          const data = await response.json();
          setSizes(data.sizes); // Assuming API returns { sizes: [] }
        } else {
          console.error("Failed to fetch sizes");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSizes();
  }, []);

  const handleEdit = (size) => {
    console.log("Edit size:", size);
    // Add your edit logic here
  };

  const handleDelete = (size) => {
    console.log("Delete size:", size);
    // Add your delete logic here
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col justify-between gap-7">
        <div className="flex justify-between items-center mb-5">
          <CardTitle className="text-4xl">Sizes</CardTitle>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
              <MoveLeft className="scale-125" />
              Back to Maintenance
            </Button>
            <AddSizeDialog />
          </div>
        </div>
        <Card className="text-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Abbreviation</TableHead>
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
              ) : sizes.length > 0 ? (
                sizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell className="w-[10%]">{size.id}</TableCell>
                    <TableCell className="w-[40%]">{size.name}</TableCell>
                    <TableCell className="w-[30%]">{size.abbreviation}</TableCell>
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
                                onClick={() => handleEdit(size)}
                              >
                                <Pencil className="scale-125" />
                                Edit
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button
                                variant="none"
                                className="font-bold text-red-500"
                                onClick={() => handleDelete(size)}
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
                    No sizes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}
