// index.js

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
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

  // States for product info fetch
  const [productData, setProductData] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(false);

  // States for measurement fetch
  const [measurementData, setMeasurementData] = useState(null);
  const [measurementLoading, setMeasurementLoading] = useState(false);
  const [measurementError, setMeasurementError] = useState(false);

  // Fetch product-related info on mount
  useEffect(() => {
    async function fetchProductRelatedInfo() {
      try {
        setProductLoading(true);
        setProductError(false);
        const res = await fetch("/api/products/get-product-related-info");
        if (!res.ok) throw new Error("Failed to fetch product info");
        const data = await res.json();
        setProductData(data);
      } catch (err) {
        setProductError(true);
      } finally {
        setProductLoading(false);
      }
    }
    fetchProductRelatedInfo();
  }, []);

  // Formik setup
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
        // Append thumbnail
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

        // Build variants
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
                Object.entries(quantities).forEach(([sz, quantity]) => {
                  formData.append(
                    `variants[${variantIndex}][quantities][${sz}]`,
                    quantity
                  );
                });
              }
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

        // Build measurements
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

        // Final submission
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

  // Derived from productData
  const types = productData?.types || [];
  const categories = productData?.categories || [];
  const tags = productData?.tags || [];
  const sizeList = productData?.sizes || [];
  const colors = productData?.colors || [];

  // Filter tags by selected type
  const filteredTags = tags.filter((tag) => tag.typeId === parseInt(values.type));
  // Order sizes
  const orderedSizes = orderSizes(sizeList);

  // Helper to get type's name
  const getTypeNameById = (id) => {
    const found = types.find((t) => t.id === parseInt(id));
    return found ? found.name : "";
  };

  // Once user selects a type, we fetch measurements
  const typeName = getTypeNameById(values.type);
  useEffect(() => {
    async function fetchMeasurements() {
      if (!typeName) {
        setMeasurementData(null);
        return;
      }
      try {
        setMeasurementLoading(true);
        setMeasurementError(false);
        const res = await fetch(
          `/api/products/get-measurement-by-type?productType=${typeName}`
        );
        if (!res.ok) throw new Error("Failed to fetch measurements");
        const data = await res.json();
        setMeasurementData(data);
      } catch (err) {
        setMeasurementError(true);
      } finally {
        setMeasurementLoading(false);
      }
    }
    fetchMeasurements();
  }, [typeName]);

  // Size add / remove
  const addSize = (sizeAbbreviation) => {
    const newSizes = [...values.sizes, sizeAbbreviation];
    setFieldValue("sizes", newSizes);

    // if no measurements yet, create initial
    if (values.measurements.length === 0) {
      const initialMeasurementValues = [{ size: sizeAbbreviation, value: "" }];
      setFieldValue("measurements", [
        { measurementName: "", values: initialMeasurementValues }
      ]);
    } else {
      // update existing measurements
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

    // also update variant quantities
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

  return (
    <DashboardLayoutWrapper>
      {/* Display product info error */}
      {productError && (
        <div className="mb-3 bg-red-600 text-white p-3 rounded">
          Failed to load product information
        </div>
      )}
      {/* Display measurement error */}
      {measurementError && (
        <div className="mb-3 bg-red-600 text-white p-3 rounded">
          Failed to load measurements information
        </div>
      )}

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
                      onValueChange={(val) => {
                        setFieldValue("type", val);
                        setFieldValue("tags", "");
                        setFieldValue("sizes", []);
                        setFieldValue("measurements", []);
                      }}
                      disabled={productLoading}
                    >
                      <SelectTrigger
                        className={`${InputErrorStyle(errors.type, touched.type)}`}
                      >
                        <SelectValue
                          placeholder={
                            productLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader className="animate-spin" /> Loading clothing types...
                              </span>
                            ) : (
                              "Select a type of clothing for the product"
                            )
                          }
                        >
                          {values.type
                            ? productData?.types?.find(
                                (t) => t.id === parseInt(values.type)
                              )?.name
                            : "Select a type of clothing product"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(productData?.types || []).map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                              {t.name}
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
                    <Select
                      onValueChange={(val) => setFieldValue("category", val)}
                      disabled={productLoading}
                    >
                      <SelectTrigger
                        className={InputErrorStyle(errors.category, touched.category)}
                      >
                        <SelectValue
                          placeholder={
                            productLoading ? (
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
                          {(productData?.categories || []).map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputErrorMessage
                      error={errors.category}
                      touched={touched.category}
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <Label className="font-bold flex flex-row items-center">
                      Tag <Asterisk className="w-4" />
                    </Label>
                    <Select
                      onValueChange={(val) => setFieldValue("tags", val)}
                      disabled={!values.type || productLoading}
                    >
                      <SelectTrigger
                        className={`${InputErrorStyle(errors.tags, touched.tags)}`}
                      >
                        <SelectValue
                          placeholder={
                            productLoading ? (
                              <span className="flex items-center gap-2">
                                <Loader className="animate-spin" /> Loading tags...
                              </span>
                            ) : (
                              "Select a tag for the product"
                            )
                          }
                        >
                          {values.tags
                            ? productData?.tags?.find(
                                (tg) => tg.id === parseInt(values.tags)
                              )?.name
                            : "Select tags"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {(productData?.tags || [])
                            .filter((tg) => tg.typeId === parseInt(values.type))
                            .map((tg) => (
                              <SelectItem key={tg.id} value={tg.id.toString()}>
                                {tg.name}
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
                    {orderSizes(productData?.sizes || []).map((sz) => {
                      const selected = values.sizes.includes(sz.abbreviation);
                      return (
                        <ToggleGroupItem
                          key={sz.id}
                          value={sz.abbreviation}
                          variant="outline"
                          selected={selected}
                          onClick={() => {
                            if (!values.type) return;
                            if (selected) {
                              removeSize(sz.abbreviation);
                            } else {
                              addSize(sz.abbreviation);
                            }
                          }}
                          className="min-w-14 min-h-14 border-2"
                        >
                          {sz.abbreviation}
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

          {productLoading && (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin" />
              <span className="ml-2">Loading product data...</span>
            </div>
          )}

          <div className="mb-5 mt-10 flex flex-row items-center gap-5">
            <CardTitle className="text-2xl min-w-[8.7rem]">Size Guide</CardTitle>
            <div className="h-[1px] w-full bg-primary/25"></div>
          </div>

          {/* For measurement data */}
          {measurementLoading && (
            <div className="flex justify-center items-center">
              <Loader className="animate-spin" />
              <span className="ml-2">Loading measurements...</span>
            </div>
          )}
          {!measurementLoading && measurementData && values.sizes.length > 0 && (
            <SpecificMeasurements
              measurementsData={measurementData}
              selectedSizes={values.sizes}
              measurements={values.measurements}
              errors={errors.measurements}
              touched={touched.measurements}
              setFieldValue={setFieldValue}
              handleBlur={handleBlur}
              handleChange={handleChange}
              sizes={orderSizes(productData?.sizes || [])}
            />
          )}

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
                      onRemove={() => remove(index)}
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
