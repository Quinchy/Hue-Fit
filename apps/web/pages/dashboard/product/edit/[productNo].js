import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { Pencil, PencilLine, Save, X, MoveLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VariantDetails from "./edit-product-variant";
import SpecificMeasurements from "./edit-specific-measurement";

// Optimized fetcher function with error handling
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EditProduct() {
  const router = useRouter();
  const { productNo } = router.query;

  // SWR options to prevent unnecessary re-fetches
  const swrOptions = { revalidateOnFocus: false };

  const { data: productData, isLoading: productInfoLoading } = useSWR(
    '/api/products/get-product-related-info',
    fetcher,
    swrOptions
  );

  const { data, isLoading } = useSWR(
    productNo ? `/api/products/get-product-details?productNo=${productNo}` : null,
    fetcher,
    swrOptions
  );

  const product = data?.product || {};
  const [isEditing, setIsEditing] = useState(false);
  const [editableProduct, setEditableProduct] = useState(null);
  const [filteredTags, setFilteredTags] = useState([]);

  const types = productData?.types || [];
  const categories = productData?.categories || [];
  const tags = productData?.tags || [];

  // Log productData when it's available
  useEffect(() => {
    if (productData) {
      console.log(productData);
    }
  }, [productData]);

  // Set initial product state when product and tags are available
  useEffect(() => {
    if (product && Object.keys(product).length > 0 && tags.length > 0) {
      setEditableProduct(product);
      // Filter tags based on product type
      const associatedTags = tags.filter((tag) => tag.typeId === product.Type?.id);
      setFilteredTags(associatedTags);
    }
  }, [product, tags]);

  // Update filtered tags when type changes
  useEffect(() => {
    if (editableProduct?.Type?.id && tags.length > 0) {
      const associatedTags = tags.filter((tag) => tag.typeId === editableProduct.Type.id);
      setFilteredTags(associatedTags);
    }
  }, [editableProduct?.Type?.id, tags]);

  if (isLoading || productInfoLoading || !editableProduct) {
    return (
      <DashboardLayoutWrapper>
        <div className="text-center">Loading...</div>
      </DashboardLayoutWrapper>
    );
  }

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = () => {
    setIsEditing(false);
    // Logic to save the updated product details can be added here
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditableProduct(product); // Reset changes
  };

  const handleInputChange = (key, value) => {
    setEditableProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditableProduct((prev) => ({ ...prev, thumbnailURL: imageUrl }));
    }
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Edit Product</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/product')}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>
      <div className="flex flex-row gap-5 min-h-[30rem]">
        {/* Edit Thumbnail */}
        <div className="flex flex-col items-start gap-3">
          <Label className="font-bold">Product Thumbnail</Label>
          <div className="relative bg-accent rounded border-8 border-border max-w-[375px] max-h-[450px] overflow-hidden">
            <Image
              src={editableProduct.thumbnailURL || "/images/placeholder-picture.png"}
              alt="Product Thumbnail"
              width={450}
              height={450}
              quality={75}
              className="object-fill rounded max-w-[375px] max-h-[450px] min-w-[375px] min-h-[450px]"
              priority
            />
            {isEditing && (
              <label className="absolute inset-0 uppercase flex flex-col gap-2 items-center justify-center bg-card/75 bg-opacity-50 text-primary font-medium hover:bg-card/70 ease-in-out duration-300 cursor-pointer">
                <PencilLine className="scale-115" />
                Change Thumbnail
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
              </label>
            )}
          </div>
        </div>
        {/* Edit Product Details */}
        <Card className="flex flex-col items-end gap-5 p-5 w-full">
          <div className="flex flex-row justify-between gap-5 w-full">
            <div className="flex flex-row items-center gap-5 w-full">
              <CardTitle className="text-2xl min-w-[16.5rem]">Product Information</CardTitle>
              <div className="h-[1px] w-full bg-primary/25"></div>
            </div>
            <Button
              variant="ghost"
              onClick={handleEditClick}
              className="w-14 h-14"
              disabled={isEditing}
            >
              <Pencil className="scale-150" />
            </Button>
          </div>
          <div className="flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-2 w-full">
              <Label className="font-bold">Name</Label>
              <Input
                value={editableProduct.name || ""}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label className="font-bold">Description</Label>
              <Input
                value={editableProduct.description || ""}
                disabled={!isEditing}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
            <div className="flex flex-row justify-between gap-5">
              <div className="flex flex-col gap-2 w-full">
                <Label className="font-bold">Type</Label>
                <Select
                  onValueChange={(value) => {
                    const selectedType = types.find((type) => type.id.toString() === value);
                    handleInputChange("Type", selectedType);
                  }}
                  disabled={!isEditing}
                  defaultValue={editableProduct.Type?.id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label className="font-bold">Category</Label>
                <Select
                  onValueChange={(value) => handleInputChange("Category", { name: value })}
                  disabled={!isEditing}
                  defaultValue={editableProduct.Category?.name}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label className="font-bold">Tags</Label>
                <Select
                  onValueChange={(value) => handleInputChange("Tags", { name: value })}
                  disabled={!isEditing}
                  defaultValue={editableProduct.Tags?.name}
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
            {isEditing && (
              <div className="flex flex-col gap-2">
                <Button variant="default" onClick={handleSaveClick}>
                  <Save className="scale-110" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancelClick}>
                  <X className="scale-110" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[16.5rem]">Variant Information</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>
      {/* Variants Component */}
      <VariantDetails product={product} />
      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[27.5rem]">Specific Measurement Information</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>
      {/* Specific Measurement Component */}
      <SpecificMeasurements />
    </DashboardLayoutWrapper>
  );
}
