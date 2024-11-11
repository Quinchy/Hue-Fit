import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ViewProduct() {
  const router = useRouter();

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Add Product</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/product')}>
          ← Back to Products
        </Button>
      </div>

      <div className="flex gap-5 mb-10">
        <div className="w-1/4 flex items-center justify-center">
          <img src="/path/to/product-image.png" alt="Product Image" className="h-32 w-32 object-cover rounded" />
        </div>
        <Card className="flex-1 p-5">
          <h2 className="font-semibold text-lg mb-2">Product Information</h2>
          <p><strong>Product Number:</strong> X328D</p>
          <p><strong>Description:</strong> A comfortable and stylish upper wear ideal for casual outings. Made with premium cotton for breathability and durability.</p>
          <p><strong>Clothing Type:</strong> Upperwear</p>
          <p><strong>Shop:</strong> ChaCharme Men&apos;s Apparel / Clothing</p>
          <p><strong>Total Quantity:</strong> 45</p>
        </Card>
      </div>

      <div className="mb-5">
        <CardTitle className="text-2xl">Product Variant</CardTitle>
      </div>

      <div className="flex gap-5">
        <div className="w-1/4 flex items-center justify-center">
          <img src="/path/to/variant-image.png" alt="Variant Image" className="h-32 w-32 object-cover rounded" />
        </div>
        <Card className="flex-1 p-5">
          <h2 className="font-semibold text-lg mb-2">Product Variant Information</h2>
          <p><strong>Name:</strong> Blue Classic Cotton T-Shirt</p>
          <p><strong>Price:</strong> ₱415</p>
          <p><strong>Color:</strong> #5494BB</p>
          <p><strong>Size:</strong> Small, Medium, Large</p>

          <h3 className="font-semibold text-lg mt-4 mb-2">Specific Measurement Information</h3>
          <div className="mb-3">
            <h4 className="font-semibold">Small</h4>
            <p><strong>Quantity:</strong> 20</p>
            <p><strong>Context:</strong> Chest Value: 36 <span className="text-gray-500">Unit: Inch</span></p>
          </div>
          <div className="mb-3">
            <h4 className="font-semibold">Medium</h4>
            <p><strong>Quantity:</strong> 10</p>
            <p><strong>Context:</strong> Chest Value: 38 <span className="text-gray-500">Unit: Inch</span></p>
          </div>
          <div>
            <h4 className="font-semibold">Large</h4>
            <p><strong>Quantity:</strong> 15</p>
            <p><strong>Context:</strong> Chest Value: 40 <span className="text-gray-500">Unit: Inch</span></p>
          </div>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}
