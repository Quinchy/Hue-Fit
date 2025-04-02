import { useState, useEffect } from "react";
import { useFormik, FormikProvider } from "formik";
import useSWR from "swr";
import { useRouter } from "next/router";
import { productSchema } from "@/utils/validation-schema";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { LoadingMessage } from "@/components/ui/loading-message";
import GeneralInformation from "../add-product/general-information/form";
import MeasurementInformation from "../add-product/measurement-information/form";
import Variations from "../add-product/variations/form";

// SWR fetcher function
const fetcher = (url) => fetch(url).then((res) => res.json());

// Order sizes by linked list (size.nextId)
function orderSizes(sizes) {
  if (!Array.isArray(sizes)) return [];
  const sizeMap = new Map();
  const nextIds = new Set();
  sizes.forEach((size) => {
    sizeMap.set(size.id, size);
    if (size.nextId !== null) nextIds.add(size.nextId);
  });
  const startIds = sizes.map((s) => s.id).filter((id) => !nextIds.has(id));
  const ordered = [];
  startIds.forEach((startId) => {
    let curr = sizeMap.get(startId);
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      ordered.push(curr);
      visited.add(curr.id);
      curr = sizeMap.get(curr.nextId);
    }
  });
  return ordered;
}

// Recursively mark all fields as touched
function touchAllFields(errors) {
  if (typeof errors !== "object" || errors === null) return true;
  if (Array.isArray(errors)) return errors.map((e) => touchAllFields(e));
  const newTouched = {};
  for (const key in errors) {
    newTouched[key] = touchAllFields(errors[key]);
  }
  return newTouched;
}

export default function ProductForm() {
  const router = useRouter();

  const {
    data: productData,
    error: productError,
    isLoading: productLoading,
  } = useSWR("/api/products/get-product-related-info", fetcher);

  const [measurementData, setMeasurementData] = useState(null);
  const [measurementLoading, setMeasurementLoading] = useState(false);
  const [measurementError, setMeasurementError] = useState(false);
  const [orderedSizes, setOrderedSizes] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      thumbnail: null,
      name: "",
      description: "",
      type: "",
      category: "",
      tags: "",
      sizes: [],
      variants: [
        {
          price: "",
          color: "",
          sizes: [],
          images: [],
          quantities: [],
          pngClothe: null,
        },
      ],
      measurements: [],
    },
    validationSchema: productSchema,
    onSubmit: async (values, { setTouched, setErrors, setFieldError }) => {
      setSubmitting(true);
      try {
        await productSchema.validate(values, {
          context: { typeName: values.type },
          abortEarly: false,
        });
        const formData = new FormData();
        if (values.thumbnail?.file) {
          formData.append("thumbnail", values.thumbnail.file);
        }
        formData.append("name", values.name);
        formData.append("description", values.description);
        const typeObj = productData?.types?.find((t) => t.name === values.type);
        formData.append("type", typeObj ? typeObj.id : values.type);
        formData.append("category", values.category);
        const tagObj = productData?.tags?.find((tg) => tg.name === values.tags);
        if (values.tags) {
          formData.append("tag", tagObj ? tagObj.id : values.tags);
        }
        if (values.sizes.length > 0) {
          formData.append("sizes", values.sizes.join(","));
        }
        await Promise.race([
          new Promise((resolve) => {
            values.variants.forEach((variant, variantIndex) => {
              formData.append(
                `variants[${variantIndex}][price]`,
                variant.price
              );
              formData.append(
                `variants[${variantIndex}][color]`,
                variant.color
              );
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
                    `variants[${variantIndex}][images]`,
                    imageObj.file
                  );
                });
              }
              if (variant.pngClothe?.file) {
                formData.append(
                  `variants[${variantIndex}][pngClothe]`,
                  variant.pngClothe.file
                );
              }
            });
            resolve();
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Image appending timeout exceeded")),
              5000
            )
          ),
        ]);
        if (Array.isArray(values.measurements)) {
          const transformedMeasurements = [];
          values.measurements.forEach((measurement) => {
            measurement.values.forEach((val) => {
              transformedMeasurements.push({
                size: val.size,
                measurementName: measurement.measurementName,
                value: val.value,
              });
            });
          });
          formData.append(
            "measurements",
            JSON.stringify(transformedMeasurements)
          );
        }
        const response = await fetch("/api/products/add-product", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (response.ok) {
          router.push("/dashboard/product?success=true");
        } else {
          console.error("Server error:", result.message);
        }
      } catch (err) {
        let formErrors = {};
        if (err.inner?.length > 0) {
          formErrors = err.inner.reduce((acc, cur) => {
            acc[cur.path] = cur.message;
            return acc;
          }, {});
        }
        if (
          ["UPPERWEAR", "OUTERWEAR", "LOWERWEAR"].includes(values.type) &&
          (!values.variants[0].pngClothe ||
            (typeof values.variants[0].pngClothe === "object" &&
              Object.keys(values.variants[0].pngClothe).length === 0))
        ) {
          formErrors["variants[0].pngClothe"] = "PNG clothe is required.";
          setFieldError("variants[0].pngClothe", "PNG clothe is required.");
        }
        setErrors(formErrors);
        setTouched(touchAllFields(formErrors));
      } finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
  });

  const { values, errors, touched, setFieldValue, handleBlur, handleChange } =
    formik;

  useEffect(() => {
    setOrderedSizes(orderSizes(productData?.sizes || []));
  }, [productData]);

  useEffect(() => {
    async function fetchMeasurements() {
      if (!values.type) {
        setMeasurementData(null);
        return;
      }
      try {
        setMeasurementLoading(true);
        setMeasurementError(false);
        const res = await fetch(
          `/api/products/get-measurement-by-type?productType=${values.type}`
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
  }, [values.type]);

  return (
    <DashboardLayoutWrapper>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <GeneralInformation
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            productData={productData}
            productLoading={productLoading}
            setFieldValue={setFieldValue}
          />

          <MeasurementInformation
            measurementData={measurementData}
            measurementLoading={measurementLoading}
            values={values}
            errors={errors}
            touched={touched}
            setFieldValue={setFieldValue}
            handleBlur={handleBlur}
            handleChange={handleChange}
            orderedSizes={orderedSizes}
          />

          <Variations
            values={values}
            errors={errors}
            productData={productData}
            getTypeNameById={() => values.type}
            submitCount={formik.submitCount}
          />

          <Button
            type="submit"
            variant="default"
            className="w-full mt-5 mb-20"
            disabled={submitting}
          >
            {submitting ? (
              <LoadingMessage message="Adding Product..." />
            ) : (
              "Add Product"
            )}
          </Button>
        </form>
      </FormikProvider>
    </DashboardLayoutWrapper>
  );
}
