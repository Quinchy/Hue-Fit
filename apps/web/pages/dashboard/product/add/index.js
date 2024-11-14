import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from 'swr';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoveLeft } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductVariantCard from "../components/product-variant-card";
import Image from "next/image";
import { Label } from "@/components/ui/label";

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AddProduct() {
  const router = useRouter();
  const [productType, setProductType] = useState(null);
  const [measurements, setMeasurements] = useState([]);

  // Fetch product-related info
  const { data: productData, error: productError } = useSWR('/api/products/get-product-related-info', fetcher);

  // Fetch measurements based on selected productType
  useEffect(() => {
    if (productType) {
      fetch(`/api/products/get-measurement-by-type?productType=${productType}`)
        .then(res => res.json())
        .then(data => setMeasurements(data.measurements))
        .catch(err => console.error('Error fetching measurements:', err));
    }
  }, [productType]);

  if (productError) return <div>Failed to load product information</div>;
  if (!productData) return <div>Loading...</div>;

  const { types, categories, sizes, units } = productData;

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Add Product</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/product')}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>

      <div className="flex gap-5 mb-10">
        <div className="flex flex-col items-center gap-5">
          <div className="bg-accent rounded border-8 border-border">
            <Image src="/images/placeholder-picture.png" alt="Profile" width={320} height={320} className="max-w-[30rem]" />
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="scale-110 stroke-[3px] mr-2" />
            Add Thumbnail
          </Button>
        </div>
        <Card className="flex-1 p-5">
          <CardTitle className="text-2xl">Product Information</CardTitle>
          <div className="mb-4">
            <Label className="font-bold">Name</Label>
            <Input placeholder="Enter a description about the product" />
          </div>
          <div className="mb-4">
            <Label className="font-bold">Description</Label>
            <Input variant="textarea" placeholder="Enter a description about the product" />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Type</label>
            <Select onValueChange={(value) => setProductType(value)}>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Select an outfit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {types.map(type => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Category</label>
            <Select>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Select an outfit category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[14rem]">Product Variants</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>

      {/* Display Product Variant cards */}
      <ProductVariantCard />

      <Button variant="outline" className="w-full mt-4">
        <Plus className="scale-110 stroke-[3px]" />
        Add Product Variant
      </Button>

      <Button variant="default" className="w-full mt-4 mb-20">
        Submit
      </Button>
    </DashboardLayoutWrapper>
  );
}
