import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import routes from "@/routes";
import { Plus } from "lucide-react";

import AddTypeDialog from "./types/components/add-type";
import AddCategoryDialog from "./categories/components/add-category";
import AddTagDialog from "./tags/components/add-tag";
import AddColorDialog from "./colors/components/add-color";
import AddSizeDialog from "./sizes/components/add-size";
import AddMeasurementDialog from "./measurements/components/add-measurement";

import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";

// Simple fetcher for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Maintenance() {
  // Use SWR to fetch data from the API
  const {
    data: totals, // "totals" will hold our fetched data
    error,
    isLoading, // in SWR v2+, you have isLoading; otherwise use (!data && !error)
  } = useSWR("/api/maintenance/get-items-total", fetcher);

  // Handle any errors
  if (error) {
    console.error("Error fetching totals:", error);
    return <div>Failed to load totals</div>;
  }

  // Helper to render either a skeleton or the total value
  const renderSkeletonOrTotal = (value) => {
    return isLoading ? <Skeleton className="h-4 w-8" /> : value;
  };

  return (
    <DashboardLayoutWrapper>
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
              <TableCell>{renderSkeletonOrTotal(totals?.types)}</TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({ variant: "outline" })} mr-3 px-8 align-middle`}
                  href={routes.types}
                >
                  View Records
                </Link>
                <AddTypeDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Categories</TableCell>
              <TableCell>{renderSkeletonOrTotal(totals?.categories)}</TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({ variant: "outline" })} mr-3 px-8 align-middle`}
                  href={routes.categories}
                >
                  View Records
                </Link>
                <AddCategoryDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Tags</TableCell>
              <TableCell>{renderSkeletonOrTotal(totals?.tags)}</TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({ variant: "outline" })} mr-3 px-8 align-middle`}
                  href={routes.tags}
                >
                  View Records
                </Link>
                <AddTagDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Colors</TableCell>
              <TableCell>{renderSkeletonOrTotal(totals?.colors)}</TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({ variant: "outline" })} mr-3 px-8 align-middle`}
                  href={routes.colors}
                >
                  View Records
                </Link>
                <AddColorDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Sizes</TableCell>
              <TableCell>{renderSkeletonOrTotal(totals?.sizes)}</TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({ variant: "outline" })} mr-3 px-8 align-middle`}
                  href={routes.sizes}
                >
                  View Records
                </Link>
                <AddSizeDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Measurements</TableCell>
              <TableCell>{renderSkeletonOrTotal(totals?.measurements)}</TableCell>
              <TableCell className="text-end">
                <Link
                  className={`${buttonVariants({ variant: "outline" })} mr-3 px-8 align-middle`}
                  href={routes.measurements}
                >
                  View Records
                </Link>
                <AddMeasurementDialog
                  buttonClassName="align-middle px-8"
                  buttonName="Add More"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </DashboardLayoutWrapper>
  );
}
