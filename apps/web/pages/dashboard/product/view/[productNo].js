import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import routes from '@/routes';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { MoveLeft } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewProduct() {
  const router = useRouter();
  const { productNo } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productNo) {
      async function fetchProductDetails() {
        setLoading(true);
        const res = await fetch(`/api/products/get-product-details?productNo=${productNo}`);
        const data = await res.json();
        setProduct(data.product);
        setLoading(false);
      }
      fetchProductDetails();
    }
  }, [productNo]);

  if (loading) {
    return (
      <DashboardLayoutWrapper>
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

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">View Product</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.product)}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>
      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[16.5rem]">Product Information</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>
      <CardTitle className="text-2xl">{product.name}</CardTitle>
      <div className="flex gap-5 mb-10">
        <div className="flex items-start justify-center">
          {loading ? (
            <Skeleton className="h-[450px] w-[450px] rounded" />
          ) : (
            <Image
              src={product.thumbnailURL || "/images/placeholder-picture.png"}
              alt={product.name}
              width={450}
              height={450}
              quality={75}
              className="object-cover rounded"
              priority
            />
          )}
        </div>
        <Card className="flex flex-col p-5 gap-4">
          <div className="flex flex-row gap-3">
            <div className="flex flex-row items-center gap-2">
              <strong>Product Number:</strong>
              <p className="py-1 px-2 w-fit rounded text-sm font-semibold bg-slate-500">{product.productNo}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <strong>Type:</strong>
                <p className="py-1 px-2 w-fit rounded text-sm font-semibold bg-slate-500">{product.Type.name}</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <strong>Total Quantity:</strong>
              <p className="py-1 px-2 w-fit rounded text-sm font-semibold bg-slate-500">{product.totalQuantity}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <strong>Description:</strong>
              <p className="bg-accent p-3 rounded-md text-justify font-light">{product.description || "N/A"}</p>
            </div>
            <div className="flex flex-row gap-3">
              <div className="flex flex-row gap-2">
                <strong>Category:</strong>
                <p className="uppercase font-light">{product.Category.name}</p>
              </div>
              <div className="flex flex-row gap-2">
                <strong>Tags:</strong>
                <p className="uppercase font-light">{product.tags || "N/A"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[14rem]">Product Variants</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>
      <div className="flex flex-col items-start gap-5 mb-28">
        {product.ProductVariants.map((variant) => (
          <div key={variant.productVariantNo} className="flex flex-col items-start gap-5 w-full">
            <div className="flex flex-row items-start justify-center gap-5">
              {variant.ProductVariantImages.map((image) => (
                <Image
                  key={image.id}
                  src={image.imageUrl || "/images/placeholder-picture.png"}
                  alt={variant.productVariantNo}
                  width={250}
                  height={250}
                  quality={75}
                  className="object-cover rounded"
                  priority
                />
              ))}
            </div>
            <Card className="flex flex-col p-5 gap-5 w-full">
              <CardTitle className="font-bold text-2xl mb-2 capitalize">{`${variant.Color.name} ${product.name}`}</CardTitle>
              <div className="flex flex-row gap-2">
                <div className="flex flex-row items-center gap-2">
                  <strong>Variant Number:</strong>
                  <p className="py-1 px-2 w-fit rounded text-sm font-semibold bg-slate-500">{variant.productVariantNo}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <strong>Color:</strong>
                  <p className="py-1 px-2 w-fit rounded text-sm font-semibold bg-slate-500">{variant.Color.name}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <strong>Price:</strong>
                  <p className="py-1 px-2 w-fit rounded text-sm font-semibold bg-slate-500">₱{variant.price}</p>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <strong>Total Quantity:</strong>
                  <p className="py-1 px-2 w-fit rounded text-sm font-semibold bg-slate-500">{variant.totalQuantity}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="font-bold text-2xl capitalize">Specific Measurement Information:</CardTitle>
                <div className="w-full bg-accent p-2 rounded-md overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Size</TableHead>
                        {variant.ProductVariantSizes[0]?.ProductVariantMeasurements.map((measurement) => (
                          <TableHead key={measurement.id}>{measurement.Measurement.name}</TableHead>
                        ))}
                        <TableHead>Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variant.ProductVariantSizes.map((size) => (
                        <TableRow key={size.productVariantSizesNo}>
                          <TableCell className="font-medium tracking-wide">{size.Size.name} ({size.Size.abbreviation})</TableCell>
                          {size.ProductVariantMeasurements.map((measurement) => (
                            <TableCell key={measurement.id}>
                              {measurement.value} {measurement.Unit.abbreviation}
                            </TableCell>
                          ))}
                          <TableCell>{size.quantity}</TableCell>
                        </TableRow>
                      ))}
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
