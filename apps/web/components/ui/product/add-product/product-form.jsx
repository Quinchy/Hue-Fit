// components/ProductForm.js
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
import { supabase } from "@/utils/supabaseClient";

const fetcher = (url) => fetch(url).then((res) => res.json());

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

        let thumbnailURL = "";
        if (values.thumbnail?.file) {
          const { data: thumbData, error: thumbError } = await supabase.storage
            .from("products")
            .upload(
              `product-thumbnails/${Date.now()}_${values.thumbnail.file.name}`,
              values.thumbnail.file
            );
          if (thumbError) throw new Error("Thumbnail upload failed");
          thumbnailURL = supabase.storage
            .from("products")
            .getPublicUrl(thumbData.path).data.publicUrl;
        }

        const variants = await Promise.all(
          values.variants.map(async (variant) => {
            let imagesURLs = [];
            if (Array.isArray(variant.images)) {
              for (const imageObj of variant.images) {
                const { data, error } = await supabase.storage
                  .from("products")
                  .upload(
                    `product-variant-pictures/${Date.now()}_${
                      imageObj.file.name
                    }`,
                    imageObj.file
                  );
                if (!error) {
                  const url = supabase.storage
                    .from("products")
                    .getPublicUrl(data.path).data.publicUrl;
                  imagesURLs.push(url);
                }
              }
            }
            let pngClotheURL = "";
            if (variant.pngClothe?.file) {
              const { data, error } = await supabase.storage
                .from("products")
                .upload(
                  `product-virtual-fitting/${Date.now()}_${
                    variant.pngClothe.file.name
                  }`,
                  variant.pngClothe.file
                );
              if (error) throw new Error("PNG clothe upload failed");
              pngClotheURL = supabase.storage
                .from("products")
                .getPublicUrl(data.path).data.publicUrl;
            }
            return { ...variant, imagesURLs, pngClotheURL };
          })
        );

        const transformedMeasurements = [];
        if (Array.isArray(values.measurements)) {
          values.measurements.forEach((measurement) => {
            measurement.values.forEach((val) => {
              transformedMeasurements.push({
                size: val.size,
                measurementName: measurement.measurementName,
                value: val.value,
              });
            });
          });
        }

        const payload = {
          thumbnailURL,
          name: values.name,
          description: values.description,
          type: values.type,
          category: values.category,
          tags: values.tags,
          sizes: values.sizes,
          measurements: transformedMeasurements,
          variants,
        };

        const response = await fetch("/api/products/add-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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

function touchAllFields(errors) {
  if (typeof errors !== "object" || errors === null) return true;
  if (Array.isArray(errors)) return errors.map((e) => touchAllFields(e));
  const newTouched = {};
  for (const key in errors) {
    newTouched[key] = touchAllFields(errors[key]);
  }
  return newTouched;
}
