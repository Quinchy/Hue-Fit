import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import ProductForm from "@/components/ui/product/add-product/product-form";

export default function AddProduct() {
  const router = useRouter();

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center">
        <CardTitle className="text-4xl">Add Product</CardTitle>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/product")}
        >
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>
      <ProductForm />
    </DashboardLayoutWrapper>
  );
}
