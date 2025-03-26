import { useState, useEffect, useRef } from "react";
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

export default function GeneralInformation({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  productData,
  productLoading,
  setFieldValue,
}) {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(
    "/images/placeholder-picture.png"
  );

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

  const orderedSizes = orderSizes(productData?.sizes || []);

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

  const addSize = (sizeAbbreviation) => {
    const newSizes = [...values.sizes, sizeAbbreviation];
    setFieldValue("sizes", newSizes);

    if (values.measurements.length === 0) {
      const initialMeasurementValues = [{ size: sizeAbbreviation, value: "" }];
      setFieldValue("measurements", [
        { measurementName: "", values: initialMeasurementValues },
      ]);
    } else {
      const updatedMeasurements = values.measurements.map((m) => {
        const existing = m.values.find((v) => v.size === sizeAbbreviation);
        if (!existing) {
          return {
            ...m,
            values: [...m.values, { size: sizeAbbreviation, value: "" }],
          };
        }
        return m;
      });
      setFieldValue("measurements", updatedMeasurements);
    }

    values.variants.forEach((variant, index) => {
      const qExists = variant.quantities?.find(
        (q) => q.size === sizeAbbreviation
      );
      if (!qExists) {
        const newQuantities = [
          ...(variant.quantities || []),
          { size: sizeAbbreviation, quantity: "" },
        ];
        setFieldValue(`variants.${index}.quantities`, newQuantities);
      }

      const sExists = variant.sizes?.includes(sizeAbbreviation);
      if (!sExists) {
        const newVarSizes = [...(variant.sizes || []), sizeAbbreviation];
        setFieldValue(`variants.${index}.sizes`, newVarSizes);
      }
    });
  };

  const removeSize = (sizeAbbreviation) => {
    const updatedSizes = values.sizes.filter((s) => s !== sizeAbbreviation);
    setFieldValue("sizes", updatedSizes);

    const updatedMeasurements = values.measurements.map((m) => {
      const filteredValues = m.values.filter(
        (v) => v.size !== sizeAbbreviation
      );
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
                    className={InputErrorStyle(errors.type, touched.type)}
                  >
                    <SelectValue
                      placeholder={
                        productLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader className="animate-spin" /> Loading clothing
                            types...
                          </span>
                        ) : (
                          "Select a type of clothing product"
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
                        <SelectItem key={t.id} value={t.name}>
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
                  onValueChange={(val) => {
                    handleChange({ target: { name: "category", value: val } });
                  }}
                  disabled={productLoading}
                >
                  <SelectTrigger
                    className={InputErrorStyle(
                      errors.category,
                      touched.category
                    )}
                  >
                    <SelectValue
                      placeholder={
                        productLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader className="animate-spin" /> Loading
                            categories...
                          </span>
                        ) : (
                          "Select a category for the product"
                        )
                      }
                    >
                      {values.category ||
                        "Select a category of clothing product"}
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
                <div
                  title={
                    !values.type || productLoading
                      ? "Select a type to enable this option"
                      : ""
                  }
                >
                  <Select
                    onValueChange={(val) => {
                      setFieldValue("tags", val);
                    }}
                    disabled={!values.type || productLoading}
                  >
                    <SelectTrigger
                      className={InputErrorStyle(errors.tags, touched.tags)}
                    >
                      <SelectValue
                        placeholder={
                          productLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader className="animate-spin" /> Loading
                              tags...
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
                          .filter((tg) => {
                            const type = productData?.types.find(
                              (t) => t.name === values.type
                            );
                            return tg.typeId === type?.id;
                          })
                          .map((tg) => (
                            <SelectItem key={tg.id} value={tg.name}>
                              {tg.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <InputErrorMessage error={errors.tags} touched={touched.tags} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold flex flex-row items-center">
                Size <Asterisk className="w-4" />
              </Label>
              {productLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground/50 text-sm mt-4 font-medium">
                  <Loader className="animate-spin" />
                  <span>Loading sizes...</span>
                </div>
              ) : (
                <ToggleGroup
                  key={values.type}
                  type="multiple"
                  className={`flex justify-start gap-2 select-none ${
                    !values.type
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!values.type}
                  title={
                    !values.type ? "Select a type to enable this option" : ""
                  }
                >
                  {orderedSizes.map((sz) => {
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
                        className={`min-w-14 min-h-14 border-2 ${InputErrorStyle(
                          errors.sizes,
                          touched.sizes
                        )}`}
                      >
                        {sz.abbreviation}
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
              )}
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
