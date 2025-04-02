import { FieldArray } from "formik";
import { CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import EditProductVariantCard from "./edit-product-variant-card";
import { useEffect, useState, useRef } from "react";
import { useEditProduct } from "@/providers/edit-product-provider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditVariations({ values, errors, submitCount }) {
  const { productDetails } = useEditProduct();
  const productType = productDetails?.Type?.name || "";

  // State to control filtering: false = active (default), true = archived
  const [showArchived, setShowArchived] = useState(false);

  const [submittedVariantIndices, setSubmittedVariantIndices] = useState([]);
  const lastSubmitCount = useRef(0);

  useEffect(() => {
    if (submitCount > lastSubmitCount.current) {
      setSubmittedVariantIndices(values.variants.map((_, idx) => idx));
      lastSubmitCount.current = submitCount;
    }
  }, [submitCount, values.variants, values.variants.length]);

  // Filter the variants based on archived status.
  const filteredVariants = showArchived
    ? values.variants.filter((variant) => variant.isArchived)
    : values.variants.filter((variant) => !variant.isArchived);

  return (
    <FieldArray name="variants">
      {() => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-5">
            <CardTitle className="text-2xl">Variations</CardTitle>
            <div className="h-[1px] w-full bg-primary/25"></div>
            <Select
              value={showArchived ? "archived" : "active"}
              onValueChange={(value) => setShowArchived(value === "archived")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select variant type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">Active Variants</SelectItem>
                  <SelectItem value="archived">Archived Variants</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-5">
            {filteredVariants.length > 0 ? (
              filteredVariants.map((variant, filteredIndex) => {
                // Find the original index from the full variants array.
                const originalIndex = values.variants.findIndex(
                  (v) => v === variant
                );
                return (
                  <EditProductVariantCard
                    key={originalIndex}
                    variant={variant}
                    productType={productType}
                    onRemove={() => {}}
                    // Pass the original index for field access...
                    variantIndex={originalIndex}
                    // ...and pass the display number for UI numbering.
                    displayNumber={filteredIndex + 1}
                    selectedSizes={values.sizes}
                    submitted={submittedVariantIndices.includes(originalIndex)}
                  />
                );
              })
            ) : (
              <div className="text-center text-muted-foreground">
                No {showArchived ? "archived" : "active"} variants found.
              </div>
            )}
          </div>
          <div className="flex flex-col items-center w-full">
            <ErrorMessage
              message={errors.variants}
              condition={errors.variants && typeof errors.variants === "string"}
              className="w-full"
            />
          </div>
        </div>
      )}
    </FieldArray>
  );
}
