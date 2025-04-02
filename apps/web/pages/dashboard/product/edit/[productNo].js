// File: [productNo].js
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import EditProductForm from "@/components/ui/product/edit-product/edit-product-form";
import EditProductProvider from "@/providers/edit-product-provider";

export default function EditProduct() {
  const router = useRouter();
  const { productNo } = router.query;

  return (
    <EditProductProvider>
      <DashboardLayoutWrapper>
        <div className="flex -mb-8 justify-between items-center">
          <CardTitle className="text-4xl">Edit Product</CardTitle>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/product")}
          >
            <MoveLeft className="scale-125" />
            Back to Products
          </Button>
        </div>
        <EditProductForm />
      </DashboardLayoutWrapper>
    </EditProductProvider>
  );
}
