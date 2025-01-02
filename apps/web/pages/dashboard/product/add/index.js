// index.js

import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoveLeft, Asterisk, Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { useFormik, FormikProvider, FieldArray } from "formik";
import { productSchema } from "@/utils/validation-schema";
import {
  ErrorMessage,
  InputErrorMessage,
  InputErrorStyle
} from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SpecificMeasurements from "./specific-measurements";
import ProductVariantCard from "./product-variant-card";

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

  const startIds = sizes
    .map((size) => size.id)
    .filter((id) => !nextIds.has(id));
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

function touchAllFields(errors) {
  if (typeof errors !== "object" || errors === null) return true;
  if (Array.isArray(errors)) {
    return errors.map((e) => touchAllFields(e));
  }
  const newTouched = {};
  for (const key in errors) {
    newTouched[key] = touchAllFields(errors[key]);
  }
  return newTouched;
}

export default function AddProduct() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState("/images/placeholder-picture.png");
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  // 1) Fetch global product data
  const {
    data: productData,
    error: productError,
    isLoading
  } = useSWR("/api/products/get-product-related-info", fetcher);

  // 2) Prepare form
  const formik = useFormik({
    initialValues: {
      thumbnail: null,
      name: "",
      description: "",
      type: "",
      category: "",
      tags: "",
      sizes: [],
      variants: [],
      measurements: []
    },
    validationSchema: productSchema,
    onSubmit: async (values, { setTouched }) => {
      setSubmitting(true);
      const allErrors = await formik.validateForm();

      if (Object.keys(allErrors).length > 0) {
        setTouched(touchAllFields(allErrors));
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      const timeout = (ms) =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Image appending timeout exceeded")), ms)
        );

      try {
        if (values.thumbnail && values.thumbnail.file) {
          formData.append("thumbnail", values.thumbnail.file);
        }
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("type", values.type);
        formData.append("category", values.category);
        if (values.tags) {
          formData.append("tags", values.tags);
        }
        if (values.sizes.length > 0) {
          formData.append("sizes", values.sizes.join(","));
        }

        // Building variants
        await Promise.race([
          new Promise((resolve) => {
            values.variants.forEach((variant, variantIndex) => {
              formData.append(`variants[${variantIndex}][price]`, variant.price);
              formData.append(`variants[${variantIndex}][color]`, variant.color);

              if (Array.isArray(variant.quantities)) {
                const quantities = {};
                variant.quantities.forEach((q) => {
                  quantities[q.size] = q.quantity;
                });
                Object.entries(quantities).forEach(([size, quantity]) => {
                  formData.append(
                    `variants[${variantIndex}][quantities][${size}]`,
                    quantity
                  );
                });
              }

              // images
              if (Array.isArray(variant.images)) {
                variant.images.forEach((imageObj) => {
                  formData.append(
                    `productVariant[${variantIndex}][images]`,
                    imageObj.file
                  );
                });
              }
            });
            resolve();
          }),
          timeout(5000)
        ]);

        // Building measurements
        if (Array.isArray(values.measurements)) {
          const transformedMeasurements = [];
          values.measurements.forEach((measurement) => {
            measurement.values.forEach((val) => {
              transformedMeasurements.push({
                size: val.size,
                measurementName: measurement.measurementName,
                value: val.value
              });
            });
          });
          formData.append("measurements", JSON.stringify(transformedMeasurements));
        }

        // Send request
        const response = await fetch("/api/products/add-product", {
          method: "POST",
          body: formData
        });
        const result = await response.json();

        if (response.ok) {
          router.push("/dashboard/product?success=true");
        } else {
          console.error("Server error:", result.message);
        }
      } catch (error) {
        console.error("Error during submission:", error.message);
      } finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
    validateOnSubmit: true
  });

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    handleChange
  } = formik;

  // 3) If global data fails
  if (productError) return <div>Failed to load product information</div>;

  // 4) Deconstruct data safely
  const {
    types = [],
    categories = [],
    tags = [],
    sizes = [],
    colors = []
  } = productData || {};

  // 5) helpder functions
  const getTypeNameById = (id) => {
    const type = types.find((t) => t.id === parseInt(id));
    return type ? type.name : "";
  };

  const getTagNameById = (id) => {
    const tag = tags.find((t) => t.id === parseInt(id));
    return tag ? tag.name : "";
  };

  // 6) Filter tags
  const filteredTags = tags.filter((tag) => tag.typeId === parseInt(values.type));

  // 7) Ordered sizes
  const orderedSizes = orderSizes(sizes);

  // 8) We always call the measurement SWR at top-level
  const typeName = getTypeNameById(values.type);
  const measurementUrl = typeName
    ? `/api/products/get-measurement-by-type?productType=${typeName}`
    : null;

  const {
    data: measurementsData,
    error: measurementsError,
    isLoading: measurementsLoading
  } = useSWR(measurementUrl, fetcher);

  // 9) helper add / remove sizes
  const addSize = (sizeAbbreviation) => {
    const newSizes = [...values.sizes, sizeAbbreviation];
    setFieldValue("sizes", newSizes);
    if (values.measurements.length === 0) {
      const initialMeasurementValues = [{ size: sizeAbbreviation, value: "" }];
      setFieldValue("measurements", [
        { measurementName: "", values: initialMeasurementValues }
      ]);
    } else {
      const updatedMeasurements = values.measurements.map((m) => {
        const existing = m.values.find((v) => v.size === sizeAbbreviation);
        if (!existing) {
          return {
            ...m,
            values: [...m.values, { size: sizeAbbreviation, value: "" }]
          };
        }
        return m;
      });
      setFieldValue("measurements", updatedMeasurements);
    }

    values.variants.forEach((variant, index) => {
      const existing = variant.quantities?.find((q) => q.size === sizeAbbreviation);
      if (!existing) {
        const newQuantities = variant.quantities
          ? [...variant.quantities, { size: sizeAbbreviation, quantity: "" }]
          : [{ size: sizeAbbreviation, quantity: "" }];
        setFieldValue(`variants.${index}.quantities`, newQuantities);
      }
    });
  };

  const removeSize = (sizeAbbreviation) => {
    const updatedSizes = values.sizes.filter((s) => s !== sizeAbbreviation);
    setFieldValue("sizes", updatedSizes);

    const updatedMeasurements = values.measurements.map((m) => {
      const filteredValues = m.values.filter((v) => v.size !== sizeAbbreviation);
      return { ...m, values: filteredValues };
    });
    setFieldValue("measurements", updatedMeasurements);

    values.variants.forEach((variant, index) => {
      const filteredQuantities = (variant.quantities || []).filter(
        (q) => q.size !== sizeAbbreviation
      );
      setFieldValue(`variants.${index}.quantities`, filteredQuantities);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const uniqueId = `${file.name}-${Date.now()}`;
      const thumbnail = { file, url: imageUrl, id: uniqueId };
      setPreviewImage(imageUrl);
      setFieldValue("thumbnail", thumbnail);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isCoreProductValid = () => {
    return (
      values.thumbnail &&
      values.name &&
      values.type &&
      values.category &&
      values.tags &&
      !errors.thumbnail &&
      !errors.name &&
      !errors.type &&
      !errors.category &&
      !errors.tags
    );
  };

  // 10) if measurement fails
  if (measurementsError) return <div>Failed to load measurements information</div>;

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Add Product</CardTitle>
        <Button variant="outline" onClick={() => router.push("/dashboard/product")}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-3 mb-10">
            <div className="flex flex-row items-center gap-5">
              <CardTitle className="text-2xl min-w-[7rem]">Product</CardTitle>
              <div className="h-[1px] w-full bg-primary/25"></div>
            </div>
            <Card className="flex flex-row p-5 gap-5">
              <div className="flex flex-col items-start gap-1">
                <Label className="font-bold flex flex-row items-center">
                  Thumbnail <Asterisk className="w-4" />
                </Label>
                <div
                  className={`${InputErrorStyle(
                    errors.thumbnail,
                    touched.thumbnail
                  )} bg-accent rounded border-4 border-dashed border-border w-80 h-[420px] overflow-hidden`}
                >
                  <Image
                    src={previewImage}
                    alt="Product Preview"
                    width={320}
                    height={420}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                <InputErrorMessage error={errors.thumbnail} touched={touched.thumbnail} />
                <Button
                  variant="outline"
                  type="button"
                  className="w-full mt-2"
                  onClick={openFilePicker}
                >
                  <Plus className="scale-110 stroke-[3px] mr-2" /> Upload Image
                </Button>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="font-bold flex flex-row items-center">
                    Name <Asterisk className="w-4" />
                  </Label>
                  <Input
                    placeholder="Enter the name of the product"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={InputErrorStyle(errors.name, touched.name)}
                  />
                  <InputErrorMessage error={errors.name} touched={touched.name} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="font-bold">Description</Label>
                  <Input
                    variant="textarea"
                    placeholder="Place a description for the product"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="flex flex-row justify-between gap-3">
                  <div className="flex flex-col gap-1 w-full">
                    <Label className="font-bold flex flex-row items-center">
                      Type <Asterisk className="w-4" />
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setFieldValue("type", value);
                        setFieldValue("tags", "");
                        setFieldValue("sizes", []);
                        setFieldValue("measurements", []);
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className={`${InputErrorStyle(errors.type, touched.type)}`}>
                        <SelectValue
                          placeholder={
                            isLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader className="animate-spin" /> Loading clothing types...
                              </span>
                            ) : (
                              "Select a type of clothing for the product"
                            )
                          }
                        >
                          {values.type || "Select a type of clothing product"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {types.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputErrorMessage error={errors.type} touched={touched.type} />
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <Label className="font-bold flex flex-row items-center">
                      Category <Asterisk className="w-4" />
                    </Label>
                    <Select onValueChange={(value) => setFieldValue("category", value)} disabled={isLoading}>
                      <SelectTrigger className={InputErrorStyle(errors.category, touched.category)}>
                        <SelectValue
                          placeholder={
                            isLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader className="animate-spin" /> Loading categories...
                              </span>
                            ) : (
                              "Select a category for the product"
                            )
                          }
                        >
                          {values.category || "Select a category of clothing product"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputErrorMessage error={errors.category} touched={touched.category} />
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <Label className="font-bold flex flex-row items-center">
                      Tag <Asterisk className="w-4" />
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        setFieldValue("tags", value);
                      }}
                      disabled={!values.type || isLoading}
                    >
                      <SelectTrigger className={InputErrorStyle(errors.tags, touched.tags)}>
                        <SelectValue
                          placeholder={
                            isLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader className="animate-spin" /> Loading tags...
                              </span>
                            ) : (
                              "Select a tag for the product"
                            )
                          }
                        >
                          {values.tags || "Select tags"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(productData?.tags || [])
                            .filter((tag) => tag.typeId === parseInt(values.type))
                            .map((tag) => (
                              <SelectItem key={tag.id} value={tag.id.toString()}>
                                {tag.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputErrorMessage error={errors.tags} touched={touched.tags} />
                  </div>
                </div>

                <div className="mb-4 flex flex-col gap-1">
                  <Label className="font-bold flex flex-row items-center">
                    Size <Asterisk className="w-4" />
                  </Label>
                  <ToggleGroup
                    key={values.type}
                    type="multiple"
                    className={`flex justify-start gap-2 ${
                      !values.type ? "pointer-events-none opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {orderSizes(sizes).map((size) => {
                      const selected = values.sizes.includes(size.abbreviation);
                      return (
                        <ToggleGroupItem
                          key={size.id}
                          value={size.abbreviation}
                          variant="outline"
                          selected={selected}
                          onClick={() => {
                            if (!values.type) return;
                            if (selected) {
                              removeSize(size.abbreviation);
                            } else {
                              addSize(size.abbreviation);
                            }
                          }}
                          className="min-w-14 min-h-14 border-2"
                        >
                          {size.abbreviation}
                        </ToggleGroupItem>
                      );
                    })}
                  </ToggleGroup>
                  <InputErrorMessage
                    error={errors.sizes}
                    touched={touched.sizes}
                    condition={touched.sizes && errors.sizes}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Display if loading product info */}
          {productError ? (
            <div>Failed to load product information</div>
          ) : isLoading ? (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin" />
              <span className="ml-2">Loading product data...</span>
            </div>
          ) : null}

          <div className="mb-5 mt-10 flex flex-row items-center gap-5">
            <CardTitle className="text-2xl min-w-[8.7rem]">Size Guide</CardTitle>
            <div className="h-[1px] w-full bg-primary/25"></div>
          </div>

          {/* 9) We do the measurement SWR at top-level always */}
          {(() => {
            const typeName = types.find((t) => t.id === parseInt(values.type))?.name;
            const measurementUrl = typeName
              ? `/api/products/get-measurement-by-type?productType=${typeName}`
              : null;

            const {
              data: measurementsData,
              error: measurementsError,
              isLoading: measurementsLoading
            } = useSWR(measurementUrl, fetcher);

            if (measurementsError) {
              return <div>Failed to load measurements information</div>;
            }
            if (measurementsLoading) {
              return (
                <div className="flex justify-center items-center">
                  <Loader className="animate-spin" />
                  <span className="ml-2">Loading measurements...</span>
                </div>
              );
            }
            if (measurementsData && values.sizes.length > 0) {
              return (
                <SpecificMeasurements
                  measurementsData={measurementsData}
                  selectedSizes={values.sizes}
                  measurements={values.measurements}
                  errors={errors.measurements}
                  touched={touched.measurements}
                  setFieldValue={setFieldValue}
                  handleBlur={handleBlur}
                  handleChange={handleChange}
                  sizes={orderSizes(sizes)}
                />
              );
            }
            return null;
          })()}

          <FieldArray name="variants">
            {({ push, remove }) => (
              <>
                <div className="mb-5 mt-10 flex flex-row items-center gap-5">
                  <CardTitle className="text-2xl min-w-[9rem]">Variations</CardTitle>
                  <div className="h-[1px] w-full bg-primary/25"></div>
                </div>
                <div className="flex flex-col gap-5">
                  {values.variants.map((variant, index) => (
                    <ProductVariantCard
                      key={index}
                      variant={variant}
                      productType={values.type}
                      onRemove={() => {
                        remove(index);
                      }}
                      variantIndex={index}
                      colors={productData?.colors || []}
                      sizes={productData?.sizes || []}
                      selectedSizes={values.sizes}
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
                      quantities: []
                    };
                    values.sizes.forEach((sizeAbbr) => {
                      newVariant.quantities.push({ size: sizeAbbr, quantity: "" });
                    });
                    push(newVariant);
                  }}
                  disabled={
                    !(
                      values.thumbnail &&
                      values.name &&
                      values.type &&
                      values.category &&
                      values.tags &&
                      !errors.thumbnail &&
                      !errors.name &&
                      !errors.type &&
                      !errors.category &&
                      !errors.tags
                    )
                  }
                >
                  <Plus className="scale-110 stroke-[3px] mr-2" />
                  Add Product Variant
                </Button>
                <div className="flex flex-col items-center">
                  <ErrorMessage
                    message={errors.variants}
                    condition={errors.variants && typeof errors.variants === "string"}
                    className="mt-2"
                  />
                  <ErrorMessage
                    message="Please create at least one product variant."
                    condition={values.variants.length === 0 && !errors.variants}
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </FieldArray>

          <Button type="submit" variant="default" className="w-full mt-10 mb-20">
            {submitting ? <LoadingMessage message="Submitting..." /> : "Submit"}
          </Button>
        </form>
      </FormikProvider>
    </DashboardLayoutWrapper>
  );
}
