import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import routes from "@/routes";
import AddTypeDialog from "./types/components/add-type";
import AddCategoryDialog from "./categories/components/add-category";
import AddTagDialog from "./tags/components/add-tag";
import AddColorDialog from "./colors/components/add-color";
import AddSizeDialog from "./sizes/components/add-size";
import AddMeasurementDialog from "./measurements/components/add-measurement";
import AddUnitDialog from "./units/components/add-unit";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

export default function Maintenance() {
  const [totals, setTotals] = useState(null); // Start with null for undefined state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAndUpdateTotals = async () => {
      try {
        const cachedTotals = JSON.parse(localStorage.getItem("totals"));
        setTotals(cachedTotals); // Use cached data immediately if available

        // Fetch current totals from the server
        const response = await axios.get("/api/maintenance/get-items-total");
        const serverTotals = response.data;

        // If cache is empty or differs from server, update storage and state
        if (!cachedTotals || JSON.stringify(cachedTotals) !== JSON.stringify(serverTotals)) {
          setLoading(true); // Start loading if updates are detected
          localStorage.setItem("totals", JSON.stringify(serverTotals));
          setTotals(serverTotals);
        }
      } catch (error) {
        console.error("Failed to fetch totals:", error);
      } finally {
        setLoading(false); // Ensure loading stops
      }
    };

    fetchAndUpdateTotals();
  }, []);

  const renderSkeletonOrTotal = (value) => {
    return value === null ? <Skeleton className="h-4 w-8" /> : value; // Render skeleton only if value is null
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col justify-between gap-7">
        <CardTitle className="text-4xl">Maintenance</CardTitle>
        <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Items</TableHead>
                <TableHead>Records</TableHead>
                <TableHead className="text-end">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Types</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.types)}</TableCell>
                <TableCell className="text-end">
                  <Link className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`} href={routes.types}>View Records</Link>
                  <AddTypeDialog buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card" buttonName="Add More" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Categories</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.categories)}</TableCell>
                <TableCell className="text-end">
                  <Link className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`} href={routes.categories}>View Records</Link>
                  <AddCategoryDialog buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card" buttonName="Add More" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tags</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.tags)}</TableCell>
                <TableCell className="text-end">
                  <Link className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`} href={routes.tags}>View Records</Link>
                  <AddTagDialog buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card" buttonName="Add More" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Colors</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.colors)}</TableCell>
                <TableCell className="text-end">
                  <Link className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`} href={routes.colors}>View Records</Link>
                  <AddColorDialog buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card" buttonName="Add More" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sizes</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.sizes)}</TableCell>
                <TableCell className="text-end">
                  <Link className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`} href={routes.sizes}>View Records</Link>
                  <AddSizeDialog buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card" buttonName="Add More" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Measurements</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.measurements)}</TableCell>
                <TableCell className="text-end">
                  <Link className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`} href={routes.measurements}>View Records</Link>
                  <AddMeasurementDialog buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card" buttonName="Add More" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Units</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.units)}</TableCell>
                <TableCell className="text-end">
                  <Link className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`} href={routes.units}>View Records</Link>
                  <AddUnitDialog buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card" buttonName="Add More" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}
