import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddTagDialog from "./components/add-tag";
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

export default function Tags() {
  const router = useRouter();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch tags from the API
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/maintenance/tags/get-tags");
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags); // Assuming API returns { tags: [] }
        } else {
          console.error("Failed to fetch tags");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleEdit = (tag) => {
    console.log("Edit tag:", tag);
    // Add your edit logic here
  };

  const handleDelete = (tag) => {
    console.log("Delete tag:", tag);
    // Add your delete logic here
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col justify-between gap-7">
        <div className="flex justify-between items-center mb-5">
          <CardTitle className="text-4xl">Tags</CardTitle>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
              <MoveLeft className="scale-125" />
              Back to Maintenance
            </Button>
            <AddTagDialog />
          </div>
        </div>
        <Card className="text-2xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Assign To</TableHead>
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
              ) : tags.length > 0 ? (
                tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="w-[10%]">{tag.id}</TableCell>
                    <TableCell className="w-[40%]">{tag.name}</TableCell>
                    <TableCell className="w-[30%]">{tag.assignTo}</TableCell>
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
                                onClick={() => handleEdit(tag)}
                              >
                                <Pencil className="scale-125" />
                                Edit
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="justify-center">
                              <Button
                                variant="none"
                                className="font-bold text-red-500"
                                onClick={() => handleDelete(tag)}
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
                    No tags found.
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