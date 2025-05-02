import { useRouter } from "next/router";
import useSWR from "swr";
import routes from "@/routes";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MoveLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import dynamic from "next/dynamic";

import { useState } from "react";

// Import UI select components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Loading = dynamic(() => import("@/components/ui/loading"), {
  ssr: false,
});

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ViewProduct() {
  const router = useRouter();
  const { productNo } = router.query;

  const { data, isLoading } = useSWR(
    productNo
      ? `/api/products/get-product-details?productNo=${productNo}`
      : null,
    fetcher
  );

  const product = data?.product;
  // State to control filtering: false = active (default), true = archived
  const [showArchived, setShowArchived] = useState(false);

  if (isLoading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading product..." />
      </DashboardLayoutWrapper>
    );
  }

  if (!product) return null;

  // Gather a unique list of all measurement names for this product:
  const allMeasurementNames = Array.from(
    new Set(product.ProductMeasurement.map((pm) => pm.Measurement.name))
  );

  // Filter product variants based on archived status.
  const filteredVariants = product.ProductVariant.filter((variant) =>
    showArchived ? variant.isArchived : !variant.isArchived
  );

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">View Product</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.product)}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center gap-5">
          <CardTitle className="text-2xl min-w-[19rem]">
            Product Information
          </CardTitle>
          <div className="h-[1px] w-full bg-primary/25"></div>
        </div>
        <Card className="flex flex-row p-5 gap-5">
          <Image
            src={product.thumbnailURL || "/images/placeholder-picture.png"}
            alt={product.name}
            width={300}
            height={300}
            quality={75}
            className="object-fill rounded max-w-[300px] max-h-[300px] min-w-[300px] min-h-[300px]"
            priority
          />
          <div className="flex flex-col gap-5 w-full">
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-5">
                <div className="flex flex-row items-center gap-1">
                  <Label className="font-bold flex flex-row items-center">
                    Product Number:
                  </Label>
                  <p className="py-1 px-3 w-fit rounded text-sm bg-accent">
                    {product.productNo}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-1">
                  <Label className="font-bold flex flex-row items-center">
                    In Stocks:
                  </Label>
                  <p className="py-1 px-3 w-fit rounded text-sm bg-accent">
                    {product.totalQuantity}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-5">
                <div className="flex flex-row items-center gap-1">
                  <Label className="font-bold flex flex-row items-center">
                    Type:
                  </Label>
                  <p className="py-1 px-3 w-fit rounded text-sm bg-accent">
                    {product.Type.name}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <Label className="font-bold flex flex-row items-center">
                    Category:
                  </Label>
                  <p className="py-1 px-3 w-fit rounded text-sm bg-accent">
                    {product.Category.name}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <Label className="font-bold flex flex-row items-center">
                    Tag:
                  </Label>
                  <p className="py-1 px-3 w-fit rounded text-sm bg-accent">
                    {product.Tag.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-1">
                <Label className="font-bold flex flex-row items-center">
                  Description:
                </Label>
                <p className="py-1 px-3 rounded text-sm bg-accent w-full">
                  {product.description || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* PRODUCT VARIANTS */}
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-row items-center gap-5">
          <CardTitle className="text-2xl min-w-[15rem]">
            Product Variants
          </CardTitle>
          <div className="h-[1px] w-full bg-primary/25"></div>
          <Select
            value={showArchived ? "archived" : "active"}
            onValueChange={(value) => setShowArchived(value === "archived")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select variant type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="active">Active Variants</SelectItem>
                <SelectItem value="archived">Archived Variants</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center gap-3 mb-28">
          {filteredVariants.length > 0 ? (
            filteredVariants.map((variant) => (
              <div
                key={variant.productVariantNo}
                className="flex flex-col items-start gap-5 w-full"
              >
                <Card className="flex flex-col p-5 gap-5 w-full">
                  <div className="flex flex-col">
                    <CardTitle className="font-bold text-2xl mb-2">
                      {`${variant.Color.name} ${product.name}`}
                    </CardTitle>
                    <div className="flex flex-row items-start gap-3">
                      {variant.ProductVariantImage.map((image) => (
                        <Image
                          key={image.id}
                          src={
                            image.imageURL || "/images/placeholder-picture.png"
                          }
                          alt={variant.productVariantNo}
                          width={250}
                          height={250}
                          quality={75}
                          className="object-fit rounded max-w-[250px] max-h-[250px] min-w-[250px] min-h-[250px]"
                          priority
                        />
                      ))}
                    </div>
                    <div className="flex flex-row gap-3 mt-3">
                      <div className="flex flex-row items-center gap-2">
                        <strong>Variant Number:</strong>
                        <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-accent">
                          {variant.productVariantNo}
                        </p>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <strong>Color:</strong>
                        <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-accent">
                          {variant.Color.name}
                        </p>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <strong>Price:</strong>
                        <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-accent">
                          ₱{variant.price}
                        </p>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <strong>Total Quantity:</strong>
                        <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-accent">
                          {variant.totalQuantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PIVOTED SIZE & MEASUREMENTS TABLE */}
                  <div className="flex flex-col gap-1">
                    <CardTitle className="font-bold text-xl tracking-wider">
                      Size Chart:
                    </CardTitle>
                    <div className="w-full bg-accent p-2 rounded-md overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">
                              Size
                            </TableHead>
                            {allMeasurementNames.map((mn) => (
                              <TableHead key={mn}>{mn}</TableHead>
                            ))}
                            <TableHead>Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variant.ProductVariantSize.map((pvs) => {
                            const sizeDisplay = pvs.Size.abbreviation
                              ? `${pvs.Size.name} (${pvs.Size.abbreviation})`
                              : pvs.Size.name;
                            return (
                              <TableRow key={pvs.id}>
                                <TableCell className="font-medium tracking-wide">
                                  {sizeDisplay}
                                </TableCell>
                                {allMeasurementNames.map((measurementName) => {
                                  const matchedMeasurement =
                                    product.ProductMeasurement.find(
                                      (pm) =>
                                        pm.sizeId === pvs.sizeId &&
                                        pm.Measurement.name === measurementName
                                    );
                                  const measurementValue =
                                    matchedMeasurement &&
                                    matchedMeasurement.value &&
                                    matchedMeasurement.unit
                                      ? `${
                                          matchedMeasurement.value
                                        } ${matchedMeasurement.unit.toUpperCase()}`
                                      : "N/A";
                                  return (
                                    <TableCell key={measurementName}>
                                      {measurementValue}
                                    </TableCell>
                                  );
                                })}
                                <TableCell>{pvs.quantity}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </Card>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground text-lg font-extralight mt-10">
              No {showArchived ? "archived" : "active"} variants found.
            </div>
          )}
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
