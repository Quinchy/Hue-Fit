import { FieldArray } from "formik";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ErrorMessage } from "@/components/ui/error-message";
import ProductVariantCard from "./product-variant-card";
import { useEffect, useState, useRef } from "react";

export default function Variations({
  values,
  errors,
  productData,
  getTypeNameById,
  submitCount,
}) {
  const [submittedVariantIndices, setSubmittedVariantIndices] = useState([]);
  const lastSubmitCount = useRef(0);

  useEffect(() => {
    if (submitCount > lastSubmitCount.current) {
      // Only include currently displayed variant indices
      setSubmittedVariantIndices(values.variants.map((_, idx) => idx));
      lastSubmitCount.current = submitCount;
    }
  }, [submitCount, values.variants, values.variants.length]);
  return (
    <FieldArray name="variants">
      {({ push, remove }) => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-5">
            <CardTitle className="text-2xl min-w-[9rem]">Variations</CardTitle>
            <div className="h-[1px] w-full bg-primary/25 mt-2"></div>
          </div>
          <div className="flex flex-col gap-5">
            {values.variants.map((variant, index) => (
              <ProductVariantCard
                key={index}
                variant={variant}
                productType={getTypeNameById(values.type)}
                onRemove={() => remove(index)}
                variantIndex={index}
                colors={productData?.colors || []}
                sizes={productData?.sizes || []}
                selectedSizes={values.sizes}
                submitted={submittedVariantIndices.includes(index)}
              />
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 mb-4"
            type="button"
            onClick={() => {
              const newVariant = {
                price: "",
                color: "",
                sizes: [...values.sizes],
                images: [],
                quantities: [],
                pngClothe: null,
              };
              values.sizes.forEach((sizeAbbr) => {
                newVariant.quantities.push({ size: sizeAbbr, quantity: "" });
              });
              push(newVariant);
            }}
          >
            <Plus className="scale-110 stroke-[3px]" />
            Add Product Variant
          </Button>
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
