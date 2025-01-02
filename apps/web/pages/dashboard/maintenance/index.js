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
import AddTypeDialog from "./types/components/add-type";
import AddCategoryDialog from "./categories/components/add-category";
import AddTagDialog from "./tags/components/add-tag";
import AddColorDialog from "./colors/components/add-color";
import AddSizeDialog from "./sizes/components/add-size";
import AddMeasurementDialog from "./measurements/components/add-measurement";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Maintenance() {
  const { data: totals, isLoading } = useSWR("/api/maintenance/get-items-total", fetcher);

  const renderSkeletonOrTotal = (value) => {
    return isLoading ? <Skeleton className="h-4 w-8" /> : value;
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col justify-between gap-7">
        <CardTitle className="text-4xl">Maintenance</CardTitle>
        <Card className="flex flex-col gap-5 justify-between min-h-[49.1rem]">
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
                    className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`}
                    href={routes.types}
                  >
                    View Records
                  </Link>
                  <AddTypeDialog
                    buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card"
                    buttonName="Add More"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Categories</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.categories)}</TableCell>
                <TableCell className="text-end">
                  <Link
                    className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`}
                    href={routes.categories}
                  >
                    View Records
                  </Link>
                  <AddCategoryDialog
                    buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card"
                    buttonName="Add More"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tags</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.tags)}</TableCell>
                <TableCell className="text-end">
                  <Link
                    className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`}
                    href={routes.tags}
                  >
                    View Records
                  </Link>
                  <AddTagDialog
                    buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card"
                    buttonName="Add More"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Colors</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.colors)}</TableCell>
                <TableCell className="text-end">
                  <Link
                    className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`}
                    href={routes.colors}
                  >
                    View Records
                  </Link>
                  <AddColorDialog
                    buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card"
                    buttonName="Add More"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sizes</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.sizes)}</TableCell>
                <TableCell className="text-end">
                  <Link
                    className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`}
                    href={routes.sizes}
                  >
                    View Records
                  </Link>
                  <AddSizeDialog
                    buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card"
                    buttonName="Add More"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Measurements</TableCell>
                <TableCell>{renderSkeletonOrTotal(totals?.measurements)}</TableCell>
                <TableCell className="text-end">
                  <Link
                    className={`${buttonVariants({ variant: "default" })} mr-3 align-middle`}
                    href={routes.measurements}
                  >
                    View Records
                  </Link>
                  <AddMeasurementDialog
                    buttonClassName="bg-neutral-600 hover:bg-neutral-500 align-middle text-card"
                    buttonName="Add More"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}
