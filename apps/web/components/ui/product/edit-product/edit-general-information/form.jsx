import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Asterisk, Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEditProduct } from "@/providers/edit-product-provider";

export default function EditGeneralInformation({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  orderedSizes,
}) {
  const { productDetails } = useEditProduct();
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(
    values.thumbnail?.url || "/images/placeholder-picture.png"
  );

  const sizesFromMeasurements = productDetails?.ProductMeasurement
    ? productDetails.ProductMeasurement.map((pm) => pm.Size)
    : [];
  const uniqueSizes = [];
  const seen = new Set();
  sizesFromMeasurements.forEach((s) => {
    if (!seen.has(s.id)) {
      uniqueSizes.push(s);
      seen.add(s.id);
    }
  });
  const computedOrderedSizes = orderedSizes.length ? orderedSizes : uniqueSizes;

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

  // Since type, category, and tag are removed from Formik values,
  // we retrieve them directly from provider's productDetails.
  const typeValue = productDetails?.Type?.name || "";
  const categoryValue = productDetails?.Category?.name || "";
  const tagValue = productDetails?.Tag?.name || "";

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-5">
          <CardTitle className="text-2xl min-w-[18.15rem]">
            General Information
          </CardTitle>
          <div className="h-[1px] w-full bg-primary/30 mt-2"></div>
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
              )} bg-accent rounded-md border-2 border-dashed border-border w-[300px] h-[300px] overflow-hidden`}
            >
              <Image
                src={previewImage}
                alt="Product Preview"
                width={300}
                height={300}
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
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={openFilePicker}
            >
              <Plus className="scale-110 stroke-2" /> Upload Image
            </Button>
          </div>
          <div className="flex flex-1 flex-col items-start gap-3">
            <div className="flex flex-col gap-1 w-full">
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
            <div className="flex flex-col gap-2 w-full">
              <Label className="font-bold">Description</Label>
              <Input
                variant="textarea"
                placeholder="Place a description for the product"
                className="min-h-[6.2rem]"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
            <div className="flex flex-row justify-between gap-2 w-full">
              <div className="flex flex-col gap-1 w-full">
                <Label className="font-bold flex flex-row items-center">
                  Type <Asterisk className="w-4" />
                </Label>
                <Select disabled={true}>
                  <SelectTrigger
                    className={InputErrorStyle(errors.type, touched.type)}
                  >
                    <SelectValue
                      placeholder={typeValue || "Select a type"}
                      value={typeValue}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={typeValue}>{typeValue}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <InputErrorMessage error={errors.type} touched={touched.type} />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label className="font-bold flex flex-row items-center">
                  Category <Asterisk className="w-4" />
                </Label>
                <Select disabled={true}>
                  <SelectTrigger
                    className={InputErrorStyle(
                      errors.category,
                      touched.category
                    )}
                  >
                    <SelectValue
                      placeholder={categoryValue || "Select a category"}
                      value={categoryValue}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={categoryValue}>
                        {categoryValue}
                      </SelectItem>
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
                <Select disabled={true}>
                  <SelectTrigger
                    className={InputErrorStyle(errors.tags, touched.tags)}
                  >
                    <SelectValue
                      placeholder={tagValue || "Select a tag"}
                      value={tagValue}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={tagValue}>{tagValue}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <InputErrorMessage error={errors.tags} touched={touched.tags} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold flex flex-row items-center">
                Size <Asterisk className="w-4" />
              </Label>
              <div className="cursor-not-allowed">
                <ToggleGroup
                  key={typeValue}
                  type="multiple"
                  className="flex justify-start gap-2 select-none pointer-events-none opacity-50 cursor-not-allowed"
                  disabled={true}
                  title="Size selection is disabled"
                >
                  {computedOrderedSizes.map((sz) => (
                    <ToggleGroupItem
                      key={sz.id}
                      value={sz.abbreviation}
                      variant="outline"
                      selected={true}
                      className={`min-w-14 min-h-14 border-2 cursor-not-allowed ${InputErrorStyle(
                        errors.sizes,
                        touched.sizes
                      )}`}
                    >
                      {sz.abbreviation}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <InputErrorMessage
                error={errors.sizes}
                touched={touched.sizes}
                condition={touched.sizes && errors.sizes}
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
