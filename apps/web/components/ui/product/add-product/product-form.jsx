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
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Client-side function to upload a file to Supabase and return its public URL.
async function uploadFile(file, folderPath, uniqueId) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${uniqueId}-${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from(folderPath)
    .upload(fileName, file);
  if (error) {
    throw error;
  }
  return `${supabaseUrl}/storage/v1/object/public/${folderPath}/${fileName}`;
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
        // Validate the form values
        await productSchema.validate(values, {
          context: { typeName: values.type },
          abortEarly: false,
        });

        // Upload the thumbnail file if it exists and assign its URL
        if (values.thumbnail?.file) {
          values.thumbnail.url = await uploadFile(
            values.thumbnail.file,
            "products/product-thumbnails",
            "thumbnail"
          );
        }

        // For each variant, upload images and the PNG clothe file immediately.
        for (let i = 0; i < values.variants.length; i++) {
          const variant = values.variants[i];

          // Upload variant images and store their URLs
          if (Array.isArray(variant.images) && variant.images.length > 0) {
            const uploadedImages = await Promise.all(
              variant.images.map(async (imageObj, idx) => {
                if (imageObj.file) {
                  return await uploadFile(
                    imageObj.file,
                    "products/product-variant-pictures",
                    `variant-${i}-image-${idx}`
                  );
                }
                return null;
              })
            );
            // Save only valid URLs
            values.variants[i].imagesUrls = uploadedImages.filter((url) => url);
          }

          // Upload the PNG clothe file if provided
          if (variant.pngClothe?.file) {
            values.variants[i].pngClotheUrl = await uploadFile(
              variant.pngClothe.file,
              "products/product-virtual-fitting",
              `variant-${i}-pngClothe`
            );
          }
        }

        // Process measurements: flatten the measurement values (if needed)
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

        // Build the JSON payload following your step-by-step process
        const payload = {
          thumbnail: values.thumbnail?.url,
          name: values.name,
          description: values.description,
          // Use the type ID from productData if available or use the provided value
          type: (() => {
            const typeObj = productData?.types?.find(
              (t) => t.name === values.type
            );
            return typeObj ? typeObj.id : values.type;
          })(),
          category: values.category,
          // Use the tag ID from productData if available or use the provided value
          tag: (() => {
            const tagObj = productData?.tags?.find(
              (tg) => tg.name === values.tags
            );
            return tagObj ? tagObj.id : values.tags;
          })(),
          sizes: values.sizes.join(","), // e.g. "S,M,L"
          variants: values.variants, // Contains price, color, quantities, imagesUrls, pngClotheUrl, etc.
          measurements: transformedMeasurements,
        };

        // Submit the JSON payload using a standard POST request.
        const response = await fetch("/api/products/add-product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
        // Example of an extra check for PNG clothe requirement
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
