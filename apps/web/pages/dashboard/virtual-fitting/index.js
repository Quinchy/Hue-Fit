// /add/index.js
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardTitle } from "@/components/ui/card";
import { MoveLeft, Search, Camera, Upload } from "lucide-react";
import routes from "@/routes";
import { useRouter } from "next/router";
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function VirtualFitting() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({}); // { variantId: { file, url } }

  const { data: productsData, isLoading: productsLoading } = useSWR(
    `/api/products/get-product?page=${currentPage}&search=${searchTerm}&type=${selectedType !== 'ALL' ? selectedType : ''}`,
    fetcher
  );

  const { data: variantsData, isLoading: variantsLoading } = useSWR(
    selectedProduct ? `/api/products/get-product-variants?productId=${selectedProduct.id}` : null,
    fetcher
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (productsData?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleFileUpload = (variantId, event) => {
    const file = event.target.files[0];
    if (file && file.type === "image/png") {
      const imageURL = URL.createObjectURL(file);
      setUploadedFiles((prev) => ({ ...prev, [variantId]: { file, url: imageURL } }));
    }
  };

  const handleSubmitFile = async (variantId) => {
    if (!uploadedFiles[variantId]?.file) return;
    const formData = new FormData();
    formData.append("variantId", variantId);
    formData.append("file", uploadedFiles[variantId].file);
    try {
      const response = await fetch("/api/products/upload-virtual-clothe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if(response.ok) {
        alert("Upload successful");
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const openVirtualTryOn = (pngClotheURL) => {
    window.open(`/dashboard/virtual-fitting/virtual-try-on?pngClotheURL=${encodeURIComponent(pngClotheURL)}`, '_blank');
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Virtual Fitting</CardTitle>
      </div>
      <Card className="flex flex-row gap-4 p-5 min-h-[49.1rem] max-h-[49.1rem]">
        {/* Left side: Product search and list */}
        <ScrollArea className="w-1/2">
          <div className="flex flex-col gap-4 p-1">
            <Input
              type="text"
              className="min-w-[30rem]"
              placeholder="Search products"
              variant="icon"
              icon={Search}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="flex flex-col gap-4">
              {productsLoading || !productsData
                ? Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="mb-2 p-2 bg-accent rounded animate-pulse" />
                  ))
                : productsData.products.length === 0 ? (
                    <div className="flex items-center justify-center h-[46rem] text-primary/50 text-lg font-thin tracking-wide">
                      No products found.
                    </div>
                  ) : (
                    productsData.products.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center mb-4 p-2 bg-accent hover:ring-2 ring-primary/15 duration-300 ease-in-out rounded shadow cursor-pointer ${
                          selectedProduct?.id === product.id ? "ring-2 ring-primary/75" : ""
                        }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="relative w-16 h-16 mr-4">
                          <Image
                            src={product.thumbnailURL}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <div className="flex flex-row gap-2 items-center">
                            <p>Product Number:</p>
                            <p className="text-sm font-thin">{product.productNo}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </div>
          {productsData?.totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {currentPage > 1 && (
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)}>
                  Previous
                </Button>
              )}
              {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              {currentPage < productsData.totalPages && (
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)}>
                  Next
                </Button>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Right side: Product variants */}
        <ScrollArea className="w-1/2 bg-muted/50 rounded p-5">
          {selectedProduct ? (
            <div>
              <h2 className="text-base font-extralight mb-4">To set a Virtual Fitting, you need to upload a PNG photo of that product variant.</h2>
              {variantsLoading || !variantsData ? (
                <div>Loading variants...</div>
              ) : variantsData.length === 0 ? (
                <div>No variants found for this product.</div>
              ) : (
                variantsData.map((variant) => (
                  <Card key={variant.id} className="flex flex-col gap-2 p-4 border rounded-lg mb-2">
                    <div className="flex flex-row items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        {variant.ProductVariantImage?.[0]?.imageURL && (
                          <div className="w-14 h-14 relative">
                            <Image
                              src={variant.ProductVariantImage[0].imageURL}
                              alt={`Image for ${variant.Color.name}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded"
                            />
                          </div>
                        )}
                        <p className="font-semibold mb-2">Color: {variant.Color.name}</p>
                      </div>
                      <Button
                        variant="outline"
                        disabled={!variant.pngClotheURL}
                        onClick={() => openVirtualTryOn(variant.pngClotheURL)}
                      >
                        <Camera className="scale-125" />
                        Virtual Fit
                      </Button>
                    </div>
                    <div className="flex flex-col items-center mb-2">
                      <label
                        htmlFor={`image-${variant.id}`}
                        className={`text-center border-2 border-dashed p-4 rounded-lg w-full ${
                          variant.pngClotheURL ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        style={{
                          cursor: variant.pngClotheURL ? "not-allowed" : "pointer",
                        }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className={`stroke-primary/50 ${variant.pngClotheURL ? "opacity-50" : ""}`} />
                          <span className={`text-primary/50 font-thin ${variant.pngClotheURL ? "opacity-50" : ""}`}>
                            {variant.pngClotheURL ? "Virtual Try On is available" : "Click here to upload a PNG image"}
                          </span>
                        </div>
                        <input
                          id={`image-${variant.id}`}
                          type="file"
                          accept="image/png"
                          onChange={(e) => handleFileUpload(variant.id, e)}
                          className="hidden"
                          disabled={!!variant.pngClotheURL}
                        />
                      </label>
                      {uploadedFiles[variant.id] && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          <Image
                            src={uploadedFiles[variant.id].url}
                            alt={`Preview for ${variant.Color.name}`}
                            width={200}
                            height={200}
                            className="p-4"
                          />
                          <Button className="mt-2 w-full" onClick={() => handleSubmitFile(variant.id)}>
                            Submit
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[46rem] text-primary/50 text-lg font-thin tracking-wide">
              Select a product to view its variants and setup their virtual fit.
            </div>
          )}
        </ScrollArea>
      </Card>
    </DashboardLayoutWrapper>
  );
}