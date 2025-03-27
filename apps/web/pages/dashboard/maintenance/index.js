import { useState } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import routes from "@/routes";

import AddTypeDialog from "@/components/ui/maintenance/type/add-type";
import AddCategoryDialog from "@/components/ui/maintenance/category/add-category";
import AddTagDialog from "@/components/ui/maintenance/tag/add-tag";
import AddColorDialog from "@/components/ui/maintenance/color/add-color";
import AddSizeDialog from "@/components/ui/maintenance/size/add-size";
import AddMeasurementDialog from "@/components/ui/maintenance/measurement/add-measurement";

import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X, CircleCheck, CircleAlert } from "lucide-react";
import { Button as IconButton } from "@/components/ui/button";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Maintenance() {
  const {
    data: totals,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/maintenance/get-items-total", fetcher);

  const [alert, setAlert] = useState({ message: "", type: "", title: "" });
  const handleAlert = (message, type, title) => {
    setAlert({ message, type, title });
    if (type === "success") {
      mutate();
    }
    setTimeout(() => setAlert({ message: "", type: "", title: "" }), 5000);
  };

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
          <IconButton
            variant="ghost"
            className="ml-auto p-2"
            onClick={() => setAlert({ message: "", type: "", title: "" })}
          >
            <X className="scale-150 stroke-primary/50 -translate-x-2" />
          </IconButton>
        </Alert>
      )}
      <CardTitle className="text-4xl">Maintenance</CardTitle>
      <Card className="flex flex-col p-5 gap-5 justify-between min-h-[49.1rem]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[12rem]">Items</TableHead>
              <TableHead className="w-1/12">Records</TableHead>
              <TableHead className="text-end">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Types</TableCell>
              <TableCell>
                {isLoading ? <Skeleton className="h-4 w-8" /> : totals?.types}
              </TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({
                    variant: "outline",
                  })} mr-3 px-8 align-middle`}
                  href={routes.types}
                >
                  View Records
                </Link>
                <AddTypeDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                  onAdd={handleAlert}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Categories</TableCell>
              <TableCell>
                {isLoading ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  totals?.categories
                )}
              </TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({
                    variant: "outline",
                  })} mr-3 px-8 align-middle`}
                  href={routes.categories}
                >
                  View Records
                </Link>
                <AddCategoryDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                  onAdd={handleAlert}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Tags</TableCell>
              <TableCell>
                {isLoading ? <Skeleton className="h-4 w-8" /> : totals?.tags}
              </TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({
                    variant: "outline",
                  })} mr-3 px-8 align-middle`}
                  href={routes.tags}
                >
                  View Records
                </Link>
                <AddTagDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                  onTagAdded={handleAlert}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Colors</TableCell>
              <TableCell>
                {isLoading ? <Skeleton className="h-4 w-8" /> : totals?.colors}
              </TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({
                    variant: "outline",
                  })} mr-3 px-8 align-middle`}
                  href={routes.colors}
                >
                  View Records
                </Link>
                <AddColorDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                  onColorAdded={handleAlert}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Sizes</TableCell>
              <TableCell>
                {isLoading ? <Skeleton className="h-4 w-8" /> : totals?.sizes}
              </TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({
                    variant: "outline",
                  })} mr-3 px-8 align-middle`}
                  href={routes.sizes}
                >
                  View Records
                </Link>
                <AddSizeDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                  onSizeAdded={handleAlert}
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Measurements</TableCell>
              <TableCell>
                {isLoading ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  totals?.measurements
                )}
              </TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({
                    variant: "outline",
                  })} mr-3 px-8 align-middle`}
                  href={routes.measurements}
                >
                  View Records
                </Link>
                <AddMeasurementDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                  onMeasurementAdded={handleAlert}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </DashboardLayoutWrapper>
  );
}
