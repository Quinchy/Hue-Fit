import { Card, CardTitle } from "@/components/ui/card";

export default function VariantDetails({ product }) {
  const variants = product || [];

  return (
    <Card className="p-5">
      <CardTitle className="text-2xl">Product Variants</CardTitle>
      <pre>{JSON.stringify(variants, null, 2)}</pre>
    </Card>
  );
}
