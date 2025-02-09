import { useState } from "react";
import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, MoveRight, Loader2, TriangleAlert } from "lucide-react";
import { Formik, Form } from "formik";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";

export default function StockProductVariantCard({
  variant,
  variantIndex,
  sizes,
  reservedQuantitiesMap, // Reserved quantities mapping passed from the parent
  onAlert, // Handler from the parent for alert messages
}) {
  const productVariantSize = Array.isArray(variant?.ProductVariantSize)
    ? variant.ProductVariantSize
    : [];

  // Map the current stock per size abbreviation.
  const [quantities, setQuantities] = useState(
    productVariantSize.reduce((acc, vq) => {
      acc[vq.Size.abbreviation] = vq.quantity;
      return acc;
    }, {})
  );

  // For new increments (the amount to add per size)
  const [increments, setIncrements] = useState(
    productVariantSize.reduce((acc, vq) => {
      acc[vq.Size.abbreviation] = 0;
      return acc;
    }, {})
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle the change for the increment input (used when not using Formik)
  const handleIncrementChange = (sizeAbbr, value) => {
    if (!isEditing) return;
    const parsedValue = parseInt(value, 10);
    setIncrements((prev) => ({
      ...prev,
      [sizeAbbr]: isNaN(parsedValue) ? 0 : parsedValue,
    }));
  };

  // Update the stock by calling the update API endpoint (used when not using Formik)
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/products/update-product-stocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productVariantId: variant.id,
          increments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the current quantities with the new increments.
        const newQuantities = { ...quantities };
        Object.keys(increments).forEach((sizeAbbr) => {
          newQuantities[sizeAbbr] += increments[sizeAbbr];
        });
        setQuantities(newQuantities);
        // Reset the increments to zero
        setIncrements(
          productVariantSize.reduce((acc, vq) => {
            acc[vq.Size.abbreviation] = 0;
            return acc;
          }, {})
        );
        setIsEditing(false);
        onAlert({
          message: "Stock updated successfully.",
          type: "success",
          title: "Success",
        });
      } else {
        throw new Error(data.message || "Failed to update stock.");
      }
    } catch (error) {
      onAlert({
        message: error.message || "An error occurred.",
        type: "error",
        title: "Error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel the editing action and reset increments
  const handleCancel = () => {
    setIncrements(
      productVariantSize.reduce((acc, vq) => {
        acc[vq.Size.abbreviation] = 0;
        return acc;
      }, {})
    );
    setIsEditing(false);
  };

  // Get variant display information
  const variantColor = variant?.Color?.name || "N/A";
  const variantImageURL =
    variant?.ProductVariantImage?.[0]?.imageURL ||
    "/images/placeholder-picture.png";

  // Sort the sizes based on the provided sizes order
  const sortedVariantSizes = Array.isArray(sizes)
    ? sizes
        .map((size) =>
          productVariantSize.find(
            (vq) => vq.Size.abbreviation === size.abbreviation
          )
        )
        .filter(Boolean)
    : [];

  const threshold = 5;

  return (
    <Card className="flex flex-col p-5 gap-5">
      <div className="flex flex-row gap-5">
        {/* Left Column: Thumbnail Image */}
        <div className="w-72 h-72 relative">
          <Image
            src={variantImageURL}
            alt={`Variant ${variantIndex + 1} Thumbnail`}
            fill
            objectFit="cover"
            className="rounded"
            priority
          />
        </div>

        {/* Right Column: Details and Stock Quantities */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Header with Color and Edit Button */}
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{variantColor}</CardTitle>
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 flex items-center justify-center"
              aria-label="Edit Quantities"
              disabled={isEditing}
            >
              <Pencil className="scale-125" />
            </Button>
          </div>

          {/* List each size with its current quantity and (if editing) an input for stock increments */}
          <div className="flex flex-col gap-2">
            {!isEditing &&
              sortedVariantSizes.map((vq) => {
                const sizeAbbr = vq?.Size?.abbreviation;
                const sizeObj = sizes.find((sz) => sz.abbreviation === sizeAbbr);
                if (!sizeObj) return null;

                const currentStock = quantities[sizeAbbr] || 0;
                // Get the reserved quantity from the parent's map (or 0 if not present)
                const reservedQuantity = reservedQuantitiesMap[vq.id] || 0;

                return (
                  <div key={sizeAbbr} className="flex flex-col gap-1">
                    <Label className="font-bold">
                      {sizeObj.name} ({sizeObj.abbreviation})
                    </Label>
                    <div className="flex flex-row items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={currentStock}
                        disabled
                        className="w-full"
                      />
                      {currentStock <= threshold && reservedQuantity > 0 && (
                        <p className="text-red-500 text-sm flex flex-row items-center gap-2 bg-red-400/10 px-3 py-1 rounded-md border border-red-600/25">
                          <TriangleAlert width={20} />
                          This product size needs at least {reservedQuantity} stocks!
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

            {isEditing && (
              <Formik
                initialValues={increments}
                validate={(values) => {
                  const errors = {};
                  sortedVariantSizes.forEach((vq) => {
                    const sizeAbbr = vq?.Size?.abbreviation;
                    const reservedQuantity = reservedQuantitiesMap[vq.id] || 0;
                    if (reservedQuantity > 0 && Number(values[sizeAbbr]) < reservedQuantity) {
                      errors[sizeAbbr] = `Must add at least ${reservedQuantity} stocks`;
                    }
                    if (Number(values[sizeAbbr]) < 0) {
                      errors[sizeAbbr] = "Cannot be negative";
                    }
                  });
                  return errors;
                }}
                onSubmit={(values, { setSubmitting }) => {
                  setIsUpdating(true);
                  fetch("/api/products/update-product-stocks", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      productVariantId: variant.id,
                      increments: values,
                    }),
                  })
                    .then((response) =>
                      response.json().then((data) => ({ response, data }))
                    )
                    .then(({ response, data }) => {
                      if (response.ok) {
                        // Update the current quantities with the new increments.
                        const newQuantities = { ...quantities };
                        Object.keys(values).forEach((sizeAbbr) => {
                          newQuantities[sizeAbbr] += Number(values[sizeAbbr]);
                        });
                        setQuantities(newQuantities);
                        // Reset the increments to zero
                        setIncrements(
                          productVariantSize.reduce((acc, vq) => {
                            acc[vq.Size.abbreviation] = 0;
                            return acc;
                          }, {})
                        );
                        setIsEditing(false);
                        onAlert({
                          message: "Stock updated successfully.",
                          type: "success",
                          title: "Success",
                        });
                      } else {
                        throw new Error(data.message || "Failed to update stock.");
                      }
                    })
                    .catch((error) => {
                      onAlert({
                        message: error.message || "An error occurred.",
                        type: "error",
                        title: "Error",
                      });
                    })
                    .finally(() => {
                      setIsUpdating(false);
                      setSubmitting(false);
                    });
                }}
              >
                {({ isSubmitting, values, handleChange, handleBlur, errors, touched }) => (
                  <Form>
                    {sortedVariantSizes.map((vq) => {
                      const sizeAbbr = vq?.Size?.abbreviation;
                      const sizeObj = sizes.find((sz) => sz.abbreviation === sizeAbbr);
                      if (!sizeObj) return null;

                      const currentStock = quantities[sizeAbbr] || 0;
                      const reservedQuantity = reservedQuantitiesMap[vq.id] || 0;
                      return (
                        <div key={sizeAbbr} className="flex flex-col gap-1">
                          <Label className="font-bold">
                            {sizeObj.name} ({sizeObj.abbreviation})
                          </Label>
                          <div className="flex flex-row items-start gap-2">
                            <div className="flex flex-col gap-1">
                              <Label className="uppercase text-sm text-primary/80">
                                Add Stock
                              </Label>
                              <div className="flex flex-col gap-1 mb-4">
                                <Input
                                  type="number"
                                  name={sizeAbbr}
                                  min="0"
                                  placeholder="Amount to add"
                                  className={`w-full ${InputErrorStyle(errors[sizeAbbr], touched[sizeAbbr])}`}
                                  value={values[sizeAbbr]}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                                {touched[sizeAbbr] && errors[sizeAbbr] && (
                                  <InputErrorMessage
                                    error={errors[sizeAbbr]}
                                    touched={touched[sizeAbbr]}
                                  />
                                )}
                              </div>
                            </div>
                            <MoveRight className="scale-125 mt-10" />
                            <div className="flex flex-col gap-1">
                              <Label className="uppercase text-sm text-primary/80">
                                In Stock
                              </Label>
                              <div className="flex flex-row items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={currentStock}
                                  disabled
                                  className="w-full"
                                />
                                {currentStock <= threshold && reservedQuantity > 0 && (
                                  <p className="text-red-500 text-sm flex flex-row items-center gap-2 bg-red-400/10 px-3 py-1 rounded-md border border-red-600/25">
                                    <TriangleAlert width={20} />
                                    This product size needs at least {reservedQuantity} stocks!
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex flex-col gap-2 mt-5">
                      <Button
                        type="submit"
                        variant="default"
                        aria-label="Update Quantities"
                        className="flex items-center gap-1"
                        disabled={isSubmitting || isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        aria-label="Cancel Editing"
                        className="flex items-center gap-1"
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
