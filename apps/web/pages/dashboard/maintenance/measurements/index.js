// pages/measurements/index.js
import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { MoveLeft, ChevronDown, Pencil, Search, X, CircleCheck, CircleAlert } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";
import AddMeasurementDialog from "./components/add-measurement";
import EditMeasurementDialog from "./components/edit-measurement";
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
import Loading from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Measurements() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [measurements, setMeasurements] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", title: "" });
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Measurements
  useEffect(() => {
    const fetchMeasurements = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/maintenance/measurements/get-measurements?page=${currentPage}&search=${encodeURIComponent(
            debouncedSearchTerm
          )}`
        );
        const data = await response.json();
        setMeasurements(
          data.measurements?.map((measurement) => ({
            ...measurement,
            assignTo: measurement.Type?.name || "",
          })) || []
        );
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching measurements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [currentPage, debouncedSearchTerm]);

  // Fetch Types
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

  const handleMeasurementAdded = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Failed");
    setCurrentPage(1); // Reload after addition
  };

  const handleMeasurementEdited = (message, type) => {
    handleAlert(message, type, type === "success" ? "Success" : "Failed");
    setCurrentPage(1); // Reload after update
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const typeColorMap = {
    UPPERWEAR: "bg-blue-500",
    LOWERWEAR: "bg-teal-500",
    FOOTWEAR: "bg-purple-500",
    OUTERWEAR: "bg-cyan-500",
    DEFAULT: "bg-gray-300",
  };

  const getTypeColorClass = (typeName) => {
    return typeColorMap[typeName.toUpperCase()] || typeColorMap.DEFAULT;
  };

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading measurements..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {alert.message && (
        <Alert className="fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
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
        <CardTitle className="text-4xl">Measurements</CardTitle>
        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={() => router.push(routes.maintenance)}>
            <MoveLeft className="scale-125" />
            Back to Maintenance
          </Button>
          <Input
            type="text"
            className="min-w-[20rem]"
            placeholder="Search a measurement"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddMeasurementDialog onMeasurementAdded={handleMeasurementAdded} />
        </div>
      </div>

      <Card className="flex flex-col gap-5 p-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/12">Name</TableHead>
              <TableHead className="w-full">Assigned To</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurements.length > 0 ? (
              measurements.map((measurement) => (
                <TableRow key={measurement.id}>
                  <TableCell>{measurement.name}</TableCell>
                  <TableCell>
                    {measurement.assignTo ? (
                      <p
                        className={`py-1 max-w-[7rem] text-center mr-1 rounded font-bold text-white ${getTypeColorClass(
                          measurement.assignTo || "DEFAULT"
                        )}`}
                      >
                        {measurement.assignTo}
                      </p>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell className="w-[30%]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="font-normal flex items-center gap-1">
                          Action <ChevronDown className="scale-125" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-50">
                        <DropdownMenuGroup>
                          <DropdownMenuItem className="justify-center">
                            <Button
                              variant="none"
                              onClick={() => {
                                setSelectedMeasurement(measurement);
                                setIsEditDialogOpen(true);
                              }}
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
                  No measurements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {measurements.length > 0 && (
          <Pagination className="flex flex-col items-end">
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

      {selectedMeasurement && (
        <EditMeasurementDialog
          measurement={selectedMeasurement}
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedMeasurement(null);
            }
          }}
          onMeasurementEdited={handleMeasurementEdited}
          types={types}
        />
      )}
    </DashboardLayoutWrapper>
  );
}
