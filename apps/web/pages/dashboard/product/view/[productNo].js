// components/ViewProduct.js
import { useRouter } from 'next/router';
import useSWR from 'swr';
import routes from '@/routes';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { MoveLeft } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ViewProduct() {
  const router = useRouter();
  const { productNo } = router.query;

  const { data, isLoading } = useSWR(
    productNo ? `/api/products/get-product-details?productNo=${productNo}` : null,
    fetcher
  );

  const product = data?.product;

  if (isLoading) {
    return (
      <DashboardLayoutWrapper>
        {/* Skeleton UI while loading... */}
        <div className="flex justify-between items-center mb-5">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mb-5 flex flex-row items-center gap-5">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-[1px] w-full" />
        </div>
        <Skeleton className="h-10 w-80 mb-5" />
        <div className="flex gap-5 mb-10">
          <Skeleton className="h-[450px] w-[450px] rounded" />
          <Card className="flex flex-col w-full p-5 gap-4">
            <Skeleton className="h-6 w-80 mb-4" />
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-2" />
          </Card>
        </div>
        <div className="mb-5 flex flex-row items-center gap-5">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-[1px] w-full" />
        </div>
        <div className="flex flex-col items-start gap-5 mb-28">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-start gap-5 w-full">
              <div className="flex flex-row items-start justify-center gap-5">
                {Array.from({ length: 3 }).map((_, imgIdx) => (
                  <Skeleton key={imgIdx} className="h-[250px] w-[250px] rounded" />
                ))}
              </div>
              <Card className="flex flex-col p-5 gap-5 w-full">
                <Skeleton className="h-6 w-80 mb-4" />
                <div className="flex flex-row gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-80 mb-4" />
                <Skeleton className="h-[200px] w-full" />
              </Card>
            </div>
          ))}
        </div>
      </DashboardLayoutWrapper>
    );
  }

  if (!product) return null;

  // 1) Gather a unique list of all measurement names for this product:
  const allMeasurementNames = Array.from(
    new Set(product.ProductMeasurement.map((pm) => pm.Measurement.name))
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
      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[19rem]">Product Information</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>

      <Card className="flex flex-col p-5 gap-4">
        <CardTitle className="text-2xl">{product.name}</CardTitle>  
        <div className='flex flex-row gap-3'>
          <div className="flex items-start justify-center">
            <Image
              src={product.thumbnailURL || "/images/placeholder-picture.png"}
              alt={product.name}
              width={450}
              height={450}
              quality={75}
              className="object-fill rounded max-w-[450px] max-h-[450px] min-w-[450px] min-h-[450px]"
              priority
            />
          </div>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row gap-3">
              <div className="flex flex-row items-center gap-2">
                <strong>Product Number:</strong>
                <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-primary/10">
                  {product.productNo}
                </p>
              </div>
              <div className="flex flex-row items-center gap-2">
                <strong>Type:</strong>
                <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-primary/10">
                  {product.Type.name}
                </p>
              </div>
              <div className="flex flex-row items-center gap-2">
                <strong>Total Quantity:</strong>
                <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-primary/10">
                  {product.totalQuantity}
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-3">
              <div className="flex flex-row gap-2">
                <strong>Category:</strong>
                <p className="uppercase font-light">{product.Category.name}</p>
              </div>
              <div className="flex flex-row gap-2">
                <strong>Tags:</strong>
                <p className="uppercase font-light">{product.Tag.name || "N/A"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <strong>Description:</strong>
              <p className="bg-accent p-3 rounded-md text-justify font-light">
                {product.description || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* PRODUCT VARIANTS */}
      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[15rem]">Product Variants</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>
      <div className="flex flex-col items-start gap-5 mb-28">
        {product.ProductVariant.map((variant) => (
          <div key={variant.productVariantNo} className="flex flex-col items-start gap-5 w-full">
            <Card className="flex flex-col p-5 gap-5 w-full">
              <div className='flex flex-col'>
                <CardTitle className="font-bold text-2xl mb-2">
                  {`${variant.Color.name} ${product.name}`}
                </CardTitle>
                <div className="flex flex-row items-start gap-3">
                  {variant.ProductVariantImage.map((image) => (
                    <Image
                      key={image.id}
                      src={image.imageURL || "/images/placeholder-picture.png"}
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
                    <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-primary/10">
                      {variant.productVariantNo}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <strong>Color:</strong>
                    <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-primary/10">
                      {variant.Color.name}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <strong>Price:</strong>
                    <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-primary/10">
                      ₱{variant.price}
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <strong>Total Quantity:</strong>
                    <p className="py-1 px-3 w-fit rounded text-sm font-semibold bg-primary/10">
                      {variant.totalQuantity}
                    </p>
                  </div>
                </div>
              </div>
              {/* PIVOTED SIZE & MEASUREMENTS TABLE */}
              <div className="flex flex-col gap-1">
                <CardTitle className="font-bold text-xl tracking-wider">Size Chart:</CardTitle>
                <div className="w-full bg-accent p-2 rounded-md overflow-auto">
                  <Table>
                    {/* 1) Table header: one column for Size, then one column per measurement name, then one for Quantity */}
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Size</TableHead>
                        {allMeasurementNames.map((mn) => (
                          <TableHead key={mn}>{mn}</TableHead>
                        ))}
                        <TableHead>Quantity</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {/* 2) For each ProductVariantSize, create a row */}
                      {variant.ProductVariantSize.map((pvs) => {
                        // Combine the size + abbreviation, e.g., "Small (S)"
                        const sizeDisplay = pvs.Size.abbreviation
                          ? `${pvs.Size.name} (${pvs.Size.abbreviation})`
                          : pvs.Size.name;

                        return (
                          <TableRow key={pvs.id}>
                            {/* Size Column */}
                            <TableCell className="font-medium tracking-wide">{sizeDisplay}</TableCell>

                            {/* Measurement Columns */}
                            {allMeasurementNames.map((measurementName) => {
                              // Find the measurement record for this size + measurementName
                              const matchedMeasurement = product.ProductMeasurement.find(
                                (pm) =>
                                  pm.sizeId === pvs.sizeId &&
                                  pm.Measurement.name === measurementName
                              );

                              // If found, combine value + unit => e.g. "20 CM"
                              const measurementValue =
                                matchedMeasurement && matchedMeasurement.value && matchedMeasurement.unit
                                  ? `${matchedMeasurement.value} ${matchedMeasurement.unit.toUpperCase()}`
                                  : "N/A";

                              return (
                                <TableCell key={measurementName}>{measurementValue}</TableCell>
                              );
                            })}

                            {/* Quantity Column */}
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
        ))}
      </div>
    </DashboardLayoutWrapper>
  );
}
