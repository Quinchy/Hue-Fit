import { useState, useEffect } from "react";
import { useFormik, FormikProvider } from "formik";
import { useRouter } from "next/router";
import { editProductSchema } from "@/utils/validation-schema";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Button } from "@/components/ui/button";
import { LoadingMessage } from "@/components/ui/loading-message";
import EditGeneralInformation from "../edit-product/edit-general-information/form";
import EditMeasurementInformation from "./edit-measurement-information/form";
import EditVariations from "../edit-product/edit-variations/form";
import { useEditProduct } from "@/providers/edit-product-provider";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Client-side helper function to upload a file to Supabase
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
  const { productDetails } = useEditProduct();
  const [orderedSizes, setOrderedSizes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [measurementData, setMeasurementData] = useState(null);
  const [measurementLoading, setMeasurementLoading] = useState(false);
  const [measurementError, setMeasurementError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Build initial values from productDetails
  const initialValues = productDetails
    ? {
        thumbnail: productDetails.thumbnailURL
          ? { url: productDetails.thumbnailURL }
          : null,
        name: productDetails.name || "",
        description: productDetails.description || "",
        measurements: Object.values(
          productDetails.ProductMeasurement.reduce((acc, pm) => {
            const measurementName = pm.Measurement.name;
            if (!acc[measurementName]) {
              acc[measurementName] = {
                measurementName,
                values: [],
              };
            }
            acc[measurementName].values.push({
              size: pm.Size.abbreviation,
              value: pm.value.toString(),
              productMeasurementId: pm.id,
            });
            return acc;
          }, {})
        ),
        variants: productDetails.ProductVariant.map((variant) => ({
          price: variant.price.toString(),
          images: variant.ProductVariantImage.map((image) => ({
            url: image.imageURL,
          })),
          pngClothe: variant.pngClotheURL
            ? { url: variant.pngClotheURL }
            : null,
          isArchived: variant.isArchived,
          productVariantId: variant.id, // include the variant ID
        })),
      }
    : {
        thumbnail: null,
        name: "",
        description: "",
        measurements: [],
        variants: [
          {
            price: "",
            images: [],
            pngClothe: null,
            isArchived: false,
          },
        ],
      };

  // Fetch additional measurement data using product type from provider.
  useEffect(() => {
    async function fetchMeasurements() {
      if (!productDetails || !productDetails.Type) {
        setMeasurementData(null);
        return;
      }
      try {
        setMeasurementLoading(true);
        setMeasurementError(false);
        const res = await fetch(
          `/api/products/get-measurement-by-type?productType=${productDetails.Type.name}`
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
  }, [productDetails]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: editProductSchema,
    onSubmit: async (values, { setTouched, setErrors, setFieldError }) => {
      console.log("Submitting form with values:", values);
      setSubmitting(true);
      try {
        const validatedValues = await editProductSchema.validate(values, {
          abortEarly: false,
        });
        console.log("Validated values:", validatedValues);

        // Map measurements (include productMeasurementId for updates)
        const mappedMeasurements = validatedValues.measurements.map(
          (m, idx) => ({
            productMeasurementId: productDetails.ProductMeasurement[idx]?.id,
            measurementName: m.measurementName,
            values: m.values,
          })
        );

        // --- Upload Files on Client ---

        // Process thumbnail
        let thumbnailUrl = "";
        if (validatedValues.thumbnail) {
          if (validatedValues.thumbnail.file) {
            thumbnailUrl = await uploadFile(
              validatedValues.thumbnail.file,
              "products/product-thumbnails",
              productDetails.id.toString()
            );
          } else if (validatedValues.thumbnail.url) {
            thumbnailUrl = validatedValues.thumbnail.url;
          }
        }

        // Process each variant's files
        const processedVariants = await Promise.all(
          validatedValues.variants.map(async (variant, idx) => {
            const variantId = variant.productVariantId;
            // Process PNG clothe file
            let pngClotheUrl = "";
            if (variant.pngClothe) {
              if (variant.pngClothe.file) {
                pngClotheUrl = await uploadFile(
                  variant.pngClothe.file,
                  "products/product-virtual-fitting",
                  variantId ? variantId.toString() : `variant-${idx}`
                );
              } else if (variant.pngClothe.url) {
                pngClotheUrl = variant.pngClothe.url;
              }
            }
            // Process variant images: only include new files, not existing URLs
            let imageUrls = [];
            if (variant.images && variant.images.length > 0) {
              imageUrls = await Promise.all(
                variant.images.map(async (img, imageIndex) => {
                  if (img.file) {
                    // Upload new file and return its URL
                    return await uploadFile(
                      img.file,
                      "products/product-variant-pictures",
                      variantId
                        ? variantId.toString()
                        : `variant-${idx}-image-${imageIndex}`
                    );
                  }
                  // If no new file was selected, return null so it isn’t included
                  return null;
                })
              );
              imageUrls = imageUrls.filter((url) => url); // Remove null values
            }
            return {
              ...variant,
              pngClotheUrl,
              imageUrls,
            };
          })
        );

        // --- Build JSON Payload ---
        const payload = {
          productId: productDetails.id,
          name: validatedValues.name,
          description: validatedValues.description,
          thumbnailUrl,
          measurements: mappedMeasurements,
          variants: processedVariants,
        };

        // Submit the JSON payload to the API
        const response = await fetch("/api/products/update-product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (response.ok) {
          setShowAlert(true);
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
        const touchedFields = touchAllFields(formErrors);
        setErrors(formErrors);
        setTouched(touchedFields);
        console.log(
          "Submission failed:",
          JSON.stringify(
            { values, errors: formErrors, touched: touchedFields },
            null,
            2
          )
        );
      } finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
  });

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    handleChange,
    setErrors,
    setTouched,
  } = formik;

  useEffect(() => {
    const sizes = productDetails?.ProductMeasurement
      ? productDetails.ProductMeasurement.map((pm) => pm.Size)
      : [];
    const unique = [];
    const seen = new Set();
    sizes.forEach((s) => {
      if (!seen.has(s.id)) {
        unique.push(s);
        seen.add(s.id);
      }
    });
    setOrderedSizes(orderSizes(unique));
  }, [productDetails]);

  return (
    <DashboardLayoutWrapper>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <EditGeneralInformation
            values={values}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            setFieldValue={setFieldValue}
            orderedSizes={orderedSizes}
          />
          <EditMeasurementInformation
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
          <EditVariations
            values={values}
            errors={errors}
            submitCount={formik.submitCount}
          />
          <Button
            type="submit"
            variant="default"
            className="w-full mt-5 mb-20"
            disabled={submitting}
          >
            {submitting ? (
              <LoadingMessage message="Updating Product..." />
            ) : (
              "Update Product"
            )}
          </Button>
        </form>
        {showAlert && (
          <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
            <CheckCircle2 className="h-10 w-10 stroke-green-500" />
            <div className="ml-7">
              <AlertTitle className="text-green-400 text-base font-semibold">
                Product Updated
              </AlertTitle>
              <AlertDescription className="text-green-300">
                The product has been updated successfully.
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              className="ml-auto mr-4"
              onClick={() => setShowAlert(false)}
            >
              <X className="-translate-x-[0.85rem]" />
            </Button>
          </Alert>
        )}
      </FormikProvider>
    </DashboardLayoutWrapper>
  );
}
