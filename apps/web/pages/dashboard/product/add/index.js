// pages/dashboard/product/index.jsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useSWR from 'swr';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoveLeft, Trash2, Asterisk, Loader } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { useFormik, FormikProvider, FieldArray, setNestedObjectValues } from "formik";
import { productSchema } from "@/utils/validation-schema";
import { ErrorMessage, InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import dynamic from 'next/dynamic';
import { LoadingMessage } from "@/components/ui/loading-message";

const ProductVariantCard = dynamic(() => import('../components/product-variant-card'), { ssr: false });
const SpecificMeasurements = dynamic(() => import('../components/specific-measurements'), { ssr: false });

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AddProduct() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState("/images/placeholder-picture.png");
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: productData, error: productError, isLoading } = useSWR(
    '/api/products/get-product-related-info',
    fetcher
  );

  const formik = useFormik({
    initialValues: {
      thumbnail: null,
      name: "",
      description: "",
      type: "",
      category: "",
      tags: "",
      variants: [],
      measurementsBySize: {},
    },
    validationSchema: productSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      console.log("Form Values:", JSON.stringify(values, null, 2));
      const formData = new FormData();
      formData.append('thumbnail', values.thumbnail.file);
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('type', values.type);
      formData.append('category', values.category);
      formData.append('tags', values.tags);

      values.variants.forEach((variant, variantIndex) => {
        formData.append(`variants[${variantIndex}][price]`, variant.price);
        formData.append(`variants[${variantIndex}][color]`, variant.color);
        variant.sizes.forEach((size, sizeIndex) => {
          formData.append(`variants[${variantIndex}][sizes][${sizeIndex}]`, size);
          formData.append(`variants[${variantIndex}][quantities][${sizeIndex}]`, variant.quantities[size]);
        });
        variant.images.forEach((image, imageIndex) => {
          formData.append(`variants[${variantIndex}][images][${imageIndex}]`, image.file);
        });
      });

      formData.append('measurementsBySize', JSON.stringify(values.measurementsBySize));

      try {
        const response = await fetch('/api/products/add-product', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        console.log('Server response:', result);
        if (response.ok) {
          router.push('/dashboard/product?success=true');
        } else {
          // Handle server errors here
          console.error('Server error:', result.message);
        }
      } 
      catch (error) {
        console.error('Error submitting form:', error);
      }
      finally {
        setSubmitting(false);
      }
    },
    validateOnMount: true,
    validateOnBlur: true,
    validateOnChange: true,
  });

  if (productError) return <div>Failed to load product information</div>;

  const { types = [], categories = [], tags = [] } = productData || {};

  const getTypeNameById = (id) => {
    const type = types.find((t) => t.id === parseInt(id));
    return type ? type.name : '';
  };

  const getTagNameById = (id) => {
    const tag = tags.find((t) => t.id === parseInt(id));
    return tag ? tag.name : '';
  };

  const filteredTags = tags.filter(tag => tag.typeId === parseInt(formik.values.type));

  const isCoreProductValid = () => {
    return (
      formik.values.thumbnail &&
      formik.values.name &&
      formik.values.type &&
      formik.values.category &&
      formik.values.tags &&
      !formik.errors.thumbnail &&
      !formik.errors.name &&
      !formik.errors.type &&
      !formik.errors.category &&
      !formik.errors.tags
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const uniqueId = `${file.name}-${Date.now()}`;
      const thumbnail = { file, url: imageUrl, id: uniqueId };
      setPreviewImage(imageUrl);
      formik.setFieldValue("thumbnail", thumbnail);
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const markAllFieldsTouched = (values) => {
    const touched = {};
    const recursivelySetTouched = (obj, base = touched) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          base[key] = {};
          recursivelySetTouched(obj[key], base[key]);
        } else if (Array.isArray(obj[key])) {
          base[key] = obj[key].map((item) =>
            typeof item === 'object' && item !== null ? markAllFieldsTouched(item) : true
          );
        } else {
          base[key] = true;
        }
      });
    };
    recursivelySetTouched(values);
    return touched;
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Add Product</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/product')}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <div className="flex gap-5 mb-10">
          <div className="flex flex-col items-start gap-3">
            <Label className="font-bold flex flex-row items-center">Product Thumbnail <Asterisk className="w-4"/></Label>
            <div className="bg-accent rounded border-8 border-border w-80 h-[420px] overflow-hidden">
              <Image
                src={previewImage}
                alt="Product Preview"
                width={320}
                height={420}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => handleImageChange(e)}
            />
            <Button variant="outline" type="button" className="w-full" onClick={openFilePicker}>
              <Plus className="scale-110 stroke-[3px] mr-2" />
              Upload Image
            </Button>
            <InputErrorMessage error={formik.errors.thumbnail} touched={formik.touched.thumbnail} />
          </div>
          <Card className="flex flex-1 flex-col p-5 gap-5">
            <CardTitle className="text-2xl">Product Information</CardTitle>
            <div className="flex flex-col gap-3">
              <Label className="font-bold flex flex-row items-center">Name <Asterisk className="w-4"/></Label>
              <Input
                placeholder="Enter the product name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.name, formik.touched.name)}
              />
              <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
            </div>
            <div className="flex flex-col gap-3">
              <Label className="font-bold">Description</Label>
              <Input
                variant="textarea"
                placeholder="Enter a product description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label className="font-bold flex flex-row items-center">Type <Asterisk className="w-4"/></Label>
              <Select 
                onValueChange={(value) => {
                  formik.setFieldValue("type", value);
                  formik.setFieldValue("tags", "");
                }} 
                disabled={isLoading}
              >
                <SelectTrigger className={`w-1/2 ${InputErrorStyle(formik.errors.type, formik.touched.type)}`}>
                  <SelectValue placeholder={isLoading ? 
                    <span className="flex items-center gap-2"><Loader className="animate-spin" /> Loading clothing types...</span> 
                    : "Select a type of clothing"}>
                    {formik.values.type ? getTypeNameById(formik.values.type) : 'Select a type of clothing product'}
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
              <InputErrorMessage error={formik.errors.type} touched={formik.touched.type} />
            </div>
            <div className="flex flex-col gap-3">
              <Label className="font-bold flex flex-row items-center">Category <Asterisk className="w-4"/></Label>
              <Select 
                onValueChange={(value) => formik.setFieldValue("category", value)}
                disabled={isLoading}
              >
                <SelectTrigger className={`w-1/2 ${InputErrorStyle(formik.errors.category, formik.touched.category)}`}>
                  <SelectValue placeholder={isLoading ? 
                    <span className="flex items-center gap-2"><Loader className="animate-spin" /> Loading clothing categories...</span> 
                    : "Select a category of clothing"}>
                    {formik.values.category || 'Select a category of clothing product'}
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
              <InputErrorMessage error={formik.errors.category} touched={formik.touched.category} />
            </div>
            <div className="flex flex-col gap-3">
              <Label className="font-bold flex flex-row items-center">Tags <Asterisk className="w-4"/></Label>
              <Select 
                onValueChange={(value) => formik.setFieldValue("tags", value)}
                disabled={!formik.values.type || isLoading}
              >
                <SelectTrigger className={`w-1/2 ${InputErrorStyle(formik.errors.tags, formik.touched.tags)}`}>
                  <SelectValue placeholder={isLoading ? 
                    <span className="flex items-center gap-2"><Loader className="animate-spin" /> Loading clothing tags...</span> 
                    : "Select a tag of clothing"}>
                    {formik.values.tags ? getTagNameById(formik.values.tags) : 'Select tags'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {filteredTags.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id.toString()}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <InputErrorMessage error={formik.errors.tags} touched={formik.touched.tags} />
            </div>
          </Card>
        </div>
        <FormikProvider value={formik}>
          <FieldArray name="variants">
            {({ push, remove }) => (
              <>
                <div className="mb-5 flex flex-row items-center gap-5">
                  <CardTitle className="text-2xl min-w-[14rem]">Product Variants</CardTitle>
                  <div className="h-[1px] w-full bg-primary/25"></div>
                </div>
                <div className="flex flex-col gap-5">
                  {formik.values.variants.map((variant, index) => (
                    <ProductVariantCard
                      key={index}
                      variant={variant}
                      productType={formik.values.type}
                      onRemove={() => remove(index)}
                      variantIndex={index}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 mb-4"
                  type="button"
                  onClick={() => push({ price: '', color: '', sizes: [], quantities: {}, images: [] })}
                  disabled={!isCoreProductValid()}
                >
                  <Plus className="scale-110 stroke-[3px]" />
                  Add Product Variant
                </Button>
                <ErrorMessage
                  message={formik.errors.variants}
                  condition={formik.errors.variants && typeof formik.errors.variants === 'string'}
                  className="mt-2"
                />
                <ErrorMessage
                  message="Please create at least one product variant."
                  condition={formik.values.variants.length === 0 && !formik.errors.variants}
                  className="mt-2"
                />
              </>
            )}
          </FieldArray>
          <div className="mb-5 mt-10 flex flex-row items-center gap-5">
            <CardTitle className="text-2xl min-w-[19rem]">Specific Measurements</CardTitle>
            <div className="h-[1px] w-full bg-primary/25"></div>
          </div>
          <SpecificMeasurements formik={formik} productType={formik.values.type} />
        </FormikProvider>
        <Button
          type="submit"
          variant="default"
          className="w-full mt-10 mb-20"
        >
          {submitting ? <LoadingMessage message="Submitting..." /> : "Submit"}
        </Button>
      </form>
    </DashboardLayoutWrapper>
  );
} 
