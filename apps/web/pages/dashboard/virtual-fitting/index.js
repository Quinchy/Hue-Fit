import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardTitle } from "@/components/ui/card";
import { Search, Camera, Upload, ChevronDown, Loader2, CheckCircle2, X } from "lucide-react";
import useSWR from 'swr';
import { 
  Pagination, PaginationPrevious, PaginationItem, 
  PaginationNext, PaginationLink, PaginationContent 
} from '@/components/ui/pagination';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, 
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const fetcher = (url) => fetch(url).then((res) => res.json());

const allowedTypes = ["UPPERWEAR", "OUTERWEAR", "LOWERWEAR"];
const typeColorMap = {
  UPPERWEAR: 'bg-blue-500',
  LOWERWEAR: 'bg-teal-500',
  OUTERWEAR: 'bg-cyan-500',
  DEFAULT: 'bg-gray-300',
};

export default function VirtualFitting() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submittingVariants, setSubmittingVariants] = useState({});
  const [showAlert, setShowAlert] = useState(false);

  const NAME_LIMIT = 60;

  // 1. SWR for products
  const { data: productsData, isLoading: productsLoading } = useSWR(
    `/api/products/get-product-for-virtual-fitting?page=${currentPage}&search=${searchTerm}&type=${
      selectedType !== 'ALL' ? selectedType : ''
    }`,
    fetcher
  );

  // 2. SWR for variants (requires a selected product)
  const {
    data: variantsData,
    isLoading: variantsLoading,
    mutate: mutateVariants
  } = useSWR(
    selectedProduct
      ? `/api/products/get-product-variants?productId=${selectedProduct.id}`
      : null,
    fetcher
  );

  // Auto-hide the alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (productsData && page >= 1 && page <= productsData.totalPages) {
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

  // 3. Submitting the PNG file
  const handleSubmitFile = async (variantId) => {
    if (!uploadedFiles[variantId]?.file) return;

    setSubmittingVariants((prev) => ({ ...prev, [variantId]: true }));

    const formData = new FormData();
    formData.append("variantId", variantId);
    formData.append("file", uploadedFiles[variantId].file);

    try {
      const response = await fetch("/api/products/upload-virtual-clothe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setShowAlert(true);
        // Remove the local file preview from state
        setUploadedFiles((prev) => {
          const newState = { ...prev };
          delete newState[variantId];
          return newState;
        });
        // Revalidate the variant data to reflect updated pngClotheURL
        mutateVariants();
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setSubmittingVariants((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  // 4. Open Virtual Try-On with type & tag
  const openVirtualTryOn = (pngClotheURL, typeName, tagName) => {
    // Only pass the tag if type is LOWERWEAR
    window.open(
      `/dashboard/virtual-fitting/virtual-try-on?pngClotheURL=${encodeURIComponent(
        pngClotheURL
      )}&type=${encodeURIComponent(typeName)}&tag=${encodeURIComponent(tagName)}`,
      '_blank'
    );
  };

  // Filter products to only the allowed types
  const filteredProducts = productsData?.products.filter((product) =>
    allowedTypes.includes(product.Type.name)
  ) || [];

  const totalPages = productsData?.totalPages || 1;
  const ITEMS_PER_PAGE = 7;

  return (
    <DashboardLayoutWrapper>
      {/* Success Alert */}
      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Upload Successful
            </AlertTitle>
            <AlertDescription className="text-green-300">
              The PNG image has been uploaded successfully.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto mr-4"
            onClick={() => setShowAlert(false)}
          >
            <X />
          </Button>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Virtual Fitting</CardTitle>
      </div>

      <Card className="flex flex-row gap-4 p-5 min-h-[49.1rem] max-h-[49.1rem]">
        {/* Left column: Products List */}
        <ScrollArea className="w-1/2">
          <div className="flex flex-row gap-2 p-1">
            <Input
              type="text"
              className="min-w-[33.4rem]"
              placeholder="Search products"
              variant="icon"
              icon={Search}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="font-normal flex items-center">
                  Filter by Type
                  <ChevronDown className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleTypeSelect('ALL')}>
                    ALL
                  </DropdownMenuItem>
                  {allowedTypes.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => handleTypeSelect(type)}>
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Products List */}
          <div className="flex flex-col gap-4 p-1">
            <div className="flex flex-col gap-2">
              {productsLoading
                ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 bg-accent rounded animate-pulse"
                    />
                  ))
                : filteredProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-[46rem] text-primary/50 text-lg font-thin tracking-wide">
                      No products found.
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center p-2 bg-accent hover:ring-2 ring-primary/15 duration-300 ease-in-out rounded shadow cursor-pointer ${
                          selectedProduct?.id === product.id
                            ? "ring-2 ring-primary/75"
                            : ""
                        }`}
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="relative w-16 h-16 mr-4">
                          <Image
                            src={product.thumbnailURL}
                            alt={product.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {product.name.length > NAME_LIMIT
                                ? product.name.substring(0, NAME_LIMIT) + "..."
                                : product.name}
                            </h3>
                            <p
                              className={`py-1 px-2 rounded text-white text-xs uppercase ${
                                typeColorMap[product.Type.name] || typeColorMap.DEFAULT
                              }`}
                            >
                              {product.Type.name}
                            </p>
                          </div>
                          <div className="flex flex-row gap-2 items-center">
                            <p>Product Number:</p>
                            <p className="text-sm font-thin">{product.productNo}</p>
                          </div>
                          {/* Hidden usage of tag if needed: product.Tag?.name */}
                        </div>
                      </div>
                    ))
                  )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Pagination className="flex justify-end mt-4">
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
              )}
              <PaginationContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              </PaginationContent>
              {currentPage < totalPages && (
                <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
              )}
            </Pagination>
          )}
        </ScrollArea>

        {/* Right column: Variants */}
        <ScrollArea className="w-1/2 bg-muted/50 rounded p-5">
          {selectedProduct ? (
            <div>
              <h2 className="text-base font-extralight mb-4">
                To set a Virtual Fitting, you need to upload a PNG photo of that product variant.
              </h2>
              {variantsLoading || !variantsData ? (
                <div>Loading variants...</div>
              ) : variantsData.length === 0 ? (
                <div>No variants found for this product.</div>
              ) : (
                variantsData.map((variant) => (
                  <Card
                    key={variant.id}
                    className="flex flex-col gap-2 p-4 border rounded-lg mb-2"
                  >
                    <div className="flex flex-row items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        {variant.ProductVariantImage?.[0]?.imageURL && (
                          <div className="w-14 h-14 relative">
                            <Image
                              src={variant.ProductVariantImage[0].imageURL}
                              alt={`Image for ${variant.Color.name}`}
                              fill
                              className="rounded object-cover"
                            />
                          </div>
                        )}
                        <p className="font-semibold mb-2">
                          Color: {variant.Color.name}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        disabled={!variant.pngClotheURL}
                        onClick={() =>
                          openVirtualTryOn(
                            variant.pngClotheURL,
                            selectedProduct.Type.name,
                            // Only pass Tag if LOWERWEAR
                            selectedProduct.Type.name === 'LOWERWEAR'
                              ? selectedProduct.Tag?.name || ''
                              : ''
                          )
                        }
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
                          <Upload
                            className={`stroke-primary/50 ${
                              variant.pngClotheURL ? "opacity-50" : ""
                            }`}
                          />
                          <span
                            className={`text-primary/50 font-thin ${
                              variant.pngClotheURL ? "opacity-50" : ""
                            }`}
                          >
                            {variant.pngClotheURL
                              ? "Virtual Try On is available"
                              : "Click here to upload a PNG image"}
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
                      {/* Local Preview + Submit Button */}
                      {uploadedFiles[variant.id] && (
                        <div className="mt-2 w-full flex flex-col items-center">
                          <Image
                            src={uploadedFiles[variant.id].url}
                            alt={`Preview for ${variant.Color.name}`}
                            width={200}
                            height={200}
                            className="p-4"
                          />
                          <Button
                            className="mt-2 w-full"
                            onClick={() => handleSubmitFile(variant.id)}
                            disabled={submittingVariants[variant.id] === true}
                          >
                            {submittingVariants[variant.id] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit"
                            )}
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