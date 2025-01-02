// EditProduct.jsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import routes from '@/routes';
import useSWR from 'swr';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { Pencil, MoveLeft, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import EditProductVariantCard from "./edit-product-variant-card";
import EditSpecificMeasurements from "./edit-specific-measurements";
import Loading from "@/components/ui/loading";

const fetcher = (url) => fetch(url).then((res) => res.json());

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

export default function EditProduct() {
  const router = useRouter();
  const { productNo } = router.query;

  const { data: productData, isLoading: productInfoLoading } = useSWR(
    '/api/products/get-product-related-info',
    fetcher
  );
  const { data, isLoading } = useSWR(
    productNo ? `/api/products/get-product-details?productNo=${productNo}` : null,
    fetcher
  );

  const [product, setProduct] = useState(null);
  const [orderedSizes, setOrderedSizes] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const fileInputRef = useRef(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

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

  if (isLoading || productInfoLoading || !product) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading product..." />
      </DashboardLayoutWrapper>
    );
  }

  const handleFieldChange = (field, value) => {
    if (!isEditingProduct) return;
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleThumbnailChange = (e) => {
    if (!isEditingProduct) return;
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProduct((prev) => ({
        ...prev,
        thumbnailURL: imageUrl
      }));
    }
  };

  const handleSaveProduct = () => {
    setIsEditingProduct(false);
  };

  const handleCancelProduct = () => {
    setIsEditingProduct(false);
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
  };

  const { types = [], categories = [], colors = [] } = productData || [];

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Edit Product</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.product)}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-row items-center gap-5 w-full">
          <CardTitle className="text-2xl min-w-[7rem]">Product</CardTitle>
          <div className="h-[1px] w-full bg-primary/25"></div>
        </div>
        <Card className="flex flex-col gap-5 p-5 w-full">
          <div className="flex flex-row gap-5 w-full">
            <div className="flex flex-col gap-3">
              <Label className="font-bold">Thumbnail</Label>
              <div className="relative bg-accent rounded border-4 border-dashed border-border w-80 h-[420px] overflow-hidden">
                <Image
                  src={product.thumbnailURL || "/images/placeholder-picture.png"}
                  alt="Product Thumbnail"
                  width={320}
                  height={420}
                  quality={75}
                  className="object-cover w-full h-full"
                  priority
                />
                {isEditingProduct && (
                  <>
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={openFilePicker}
                      className="absolute inset-0 flex items-center justify-center h-full rounded-none bg-background/50"
                    >
                      <Plus className="mr-2" />
                      Upload Image
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5 w-full">
              <div className="flex flex-col gap-2 w-full">
                <Label className="font-bold">Name</Label>
                <Input
                  value={product.name || ""}
                  disabled={!isEditingProduct}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Label className="font-bold">Description</Label>
                <Input
                  value={product.description || ""}
                  variant="textarea"
                  disabled={!isEditingProduct}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                />
              </div>

              <div className="flex flex-row justify-between gap-5">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="font-bold">Type</Label>
                  <Select
                    onValueChange={(val) => handleFieldChange("TypeId", parseInt(val))}
                    disabled={!isEditingProduct}
                    value={product.TypeId ? product.TypeId.toString() : ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="font-bold">Category</Label>
                  <Select
                    onValueChange={(val) => handleFieldChange("CategoryName", val)}
                    disabled={!isEditingProduct}
                    value={product.CategoryName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label className="font-bold">Tags</Label>
                  <Select
                    onValueChange={(val) => handleFieldChange("TagName", val)}
                    disabled={!isEditingProduct || !product.TypeId}
                    value={product.TagName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.name}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="font-bold">Sizes</Label>
                <div className="flex items-center gap-3">
                  <ToggleGroup
                    type="multiple"
                    className="flex justify-start gap-2 pointer-events-none opacity-50 cursor-not-allowed"
                  >
                    {product.sizes.map((sizeAbbr) => {
                      const selected = product.sizes.includes(sizeAbbr);
                      return (
                        <ToggleGroupItem
                          key={sizeAbbr}
                          value={sizeAbbr}
                          variant="outline"
                          selected={selected}
                          className="min-w-14 min-h-14 border-2"
                        >
                          {sizeAbbr}
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                  {isEditingProduct && (
                    <Button
                      variant="outline"
                      className="w-fit"
                      onClick={() => {
                        // handle logic for adding another size
                      }}
                    >
                      Add More Size
                    </Button>
                  )}
                </div>
              </div>

              {isEditingProduct && (
                <div className="flex flex-col w-full gap-3">
                  <Button variant="default" onClick={handleSaveProduct}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancelProduct}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-start">
              <Button
                variant="ghost"
                onClick={() => setIsEditingProduct(true)}
                disabled={isEditingProduct}
                className="w-14 h-14"
              >
                <Pencil className="scale-125" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-row items-center gap-5">
          <CardTitle className="text-2xl min-w-[8.7rem]">Size Guide</CardTitle>
          <div className="h-[1px] w-full bg-primary/25"></div>
        </div>
        <EditSpecificMeasurements product={product} setProduct={setProduct} />
      </div>
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-row items-center gap-5">
          <CardTitle className="text-2xl min-w-[9rem]">Variations</CardTitle>
          <div className="h-[1px] w-full bg-primary/25"></div>
        </div>
        <div className='flex flex-col gap-3'>
          {product?.ProductVariant?.map((variant, index) => (
            <EditProductVariantCard
              key={index}
              variant={variant}
              variantIndex={index}
              colors={colors}
              sizes={orderedSizes}
            />
          ))}
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
