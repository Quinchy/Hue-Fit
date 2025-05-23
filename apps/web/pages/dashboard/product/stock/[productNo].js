import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import routes from '@/routes';
import useSWR from 'swr';
import DashboardLayoutWrapper from '@/components/ui/dashboard-layout';
import { Card, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';
import StockProductVariantCard from './stock-product-variant-card';
import dynamic from "next/dynamic";

import { Alert } from "@/components/ui/alert";
import { CircleCheck, CircleAlert, X } from 'lucide-react';

const Loading = dynamic(
  () => import("@/components/ui/loading"),
  { ssr: false }
);

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StockProduct() {
  const router = useRouter();
  const { productNo } = router.query;

  // Fetch product-related information
  const { data: productData, isLoading: productInfoLoading, error: productInfoError } = useSWR(
    '/api/products/get-product-related-info',
    fetcher
  );

  // Fetch product details based on productNo
  const { data, isLoading, error } = useSWR(
    productNo ? `/api/products/get-product-details?productNo=${productNo}` : null,
    fetcher
  );

  const [product, setProduct] = useState(null);
  const [orderedSizes, setOrderedSizes] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [alert, setAlert] = useState({ message: "", type: "", title: "" });
  const [reservedQuantitiesMap, setReservedQuantitiesMap] = useState({});

  useEffect(() => {
    if (data?.product) {
      const p = data.product;
      setProduct({
        ...p,
        thumbnailURL: p.thumbnailURL || "",
        TypeId: p.Type?.id || "",
        CategoryName: p.Category?.name || "",
        TagName: p.Tag?.name || "",
        sizes: p.ProductMeasurement
          ? Array.from(
              new Set(
                p.ProductMeasurement.map((pm) => pm.Size?.abbreviation)
              )
            ).filter(Boolean)
          : [],
        ProductVariant: p.ProductVariant || [],
        ProductMeasurement: p.ProductMeasurement || []
      });
    }
  }, [data]);

  useEffect(() => {
    if (productData?.tags && product?.TypeId) {
      const relevantTags = productData.tags.filter(
        (tag) => tag.typeId === product.TypeId
      );
      setFilteredTags(relevantTags);
    }
    if (productData?.sizes) {
      setOrderedSizes(orderSizes(productData.sizes));
    }
  }, [productData, product]);

  // Function to order sizes (same as in EditProduct.jsx)
  function orderSizes(sizes) {
    if (!Array.isArray(sizes)) return [];
    const sizeMap = new Map();
    const nextIds = new Set();

    sizes.forEach((size) => {
      sizeMap.set(size.id, size);
      if (size.nextId !== null) {
        nextIds.add(size.nextId);
      }
    });

    const startIds = sizes.map((size) => size.id).filter((id) => !nextIds.has(id));
    const orderedSizes = [];

    startIds.forEach((startId) => {
      let currentSize = sizeMap.get(startId);
      const visited = new Set();
      while (currentSize && !visited.has(currentSize.id)) {
        orderedSizes.push(currentSize);
        visited.add(currentSize.id);
        currentSize = sizeMap.get(currentSize.nextId);
      }
    });

    return orderedSizes;
  }

  // Once the product is loaded, fetch reserved quantities for each productVariantSize that has stock ≤ threshold.
  useEffect(() => {
    const threshold = 5;
    if (product && product.ProductVariant) {
      const variantSizeIds = [];
      product.ProductVariant.forEach((variant) => {
        if (Array.isArray(variant.ProductVariantSize)) {
          variant.ProductVariantSize.forEach((vps) => {
            if (vps.quantity <= threshold) {
              variantSizeIds.push(vps.id);
            }
          });
        }
      });
  
      console.log('[DEBUG][UI] Variant Size IDs with stock ≤ 5:', variantSizeIds);
  
      if (variantSizeIds.length > 0) {
        Promise.all(
          variantSizeIds.map((id) => {
            console.log(`[DEBUG][UI] Fetching reserved quantity for productVariantSizeId: ${id}`);
            return fetch(`/api/products/get-reserved-quantity?productVariantSizeId=${id}`)
              .then((res) => {
                console.log(`[DEBUG][UI] Raw response for productVariantSizeId ${id}:`, res);
                return res.json();
              })
              .then((data) => {
                console.log(`[DEBUG][UI] Data received for productVariantSizeId ${id}:`, data);
                return { id, reservedQuantity: data.reservedQuantity };
              });
          })
        )
          .then((results) => {
            console.log('[DEBUG][UI] All reserved quantity results:', results);
            const newMap = {};
            results.forEach((item) => {
              newMap[item.id] = item.reservedQuantity;
            });
            console.log('[DEBUG][UI] New reserved quantities map:', newMap);
            setReservedQuantitiesMap(newMap);
          })
          .catch((error) => {
            console.error("[DEBUG][UI] Error fetching reserved quantities:", error);
          });
      }
    }
  }, [product]);

  if (isLoading || productInfoLoading || !product) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading stock details..." />
      </DashboardLayoutWrapper>
    );
  }

  if (error || productInfoError) {
    return (
      <DashboardLayoutWrapper>
        <div className="text-red-500">
          Failed to load product data. Please try again later.
        </div>
      </DashboardLayoutWrapper>
    );
  }

  const { colors = [] } = productData || [];

  // Handler to receive alerts from child components
  const handleAlert = (newAlert) => {
    setAlert(newAlert);
  };

  return (
    <DashboardLayoutWrapper>
      {/* Alert Component */}
      {alert.message && (
        <Alert className="flex flex-row items-center fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
          {alert.type === "success" ? (
            <CircleCheck className="ml-4 scale-[200%] h-[60%] stroke-green-500" />
          ) : (
            <CircleAlert className="ml-4 scale-[200%] h-[60%] stroke-red-500" />
          )}
          <div className="flex flex-col justify-center ml-10">
            <div
              className={`text-lg font-bold ${
                alert.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {alert.title}
            </div>
            <div
              className={`tracking-wide font-light ${
                alert.type === "success" ? "text-green-300" : "text-red-300"
              }`}
            >
              {alert.message}
            </div>
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

      {/* Header Section with Manage Stock Title, Product Name, and Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <CardTitle className="text-4xl">Manage Stock</CardTitle>
        </div>
        <Button variant="outline" onClick={() => router.push(routes.product)}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>
      <Card className="p-4">
        <Label className="text-xl">{product.name}</Label>
      </Card>
      {/* Variations Section */}
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-row items-center gap-5 w-full">
          <CardTitle className="text-2xl min-w-[9rem]">Variations</CardTitle>
          <div className="h-[1px] w-full bg-primary/25"></div>
        </div>
        <div className="flex flex-col gap-3">
          {product?.ProductVariant?.map((variant, index) => (
            <StockProductVariantCard
              key={variant.id} // Use a unique identifier if available
              variant={variant}
              variantIndex={index}
              sizes={orderedSizes}
              reservedQuantitiesMap={reservedQuantitiesMap} // Pass reserved quantities map
              onAlert={handleAlert} // Pass the alert handler
            />
          ))}
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
