import * as Yup from 'yup';

export const loginSchema = Yup.object({
  username: Yup.string().required("The Username field is required."),
  password: Yup.string().required("The Password field is required."),
});

export const permissionSchema = Yup.object({
  roleId: Yup.string().required("User role is required"),
  permissions: Yup.array().of(
    Yup.object({
      page: Yup.string().required("Page is required"),
      canView: Yup.boolean(),
      canEdit: Yup.boolean(),
      canAdd: Yup.boolean(),
      canDelete: Yup.boolean(),
    })
  ),
});

export const contactInfoSchema = Yup.object({
  firstName: Yup.string().required("The First name field is required."),
  lastName: Yup.string().required("The Last name field is required."),
  position: Yup.string().required("The Position field is required."),
  contactNo: Yup.string()
    .required("The Contact Number field is required.")
    .matches(/^(\+?\d{1,4})?\d{7,12}$/, "The phone number format is invalid.")
    .test("valid-length", "The phone number format is invalid.", (value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      if (value.startsWith("09")) {
        return digits.length === 11;
      }
      if (value.startsWith("+")) {
        return digits.length >= 10 && digits.length <= 12;
      }
      return false;
    })
    .test(
      "starts-with",
      "The phone number format is invalid.",
      (value) => !value || value.startsWith("09") || value.startsWith("+")
    ),
  email: Yup.string()
    .email("The email format is invalid.")
    .required("The Email field is required."),
  username: Yup.string().required("The Username field is required."),
  password: Yup.string()
    .required("The Password field is required.")
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be less than 128 characters.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/\d/, "Password must contain at least one number.")
    .matches(
      /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]+/,
      "Password must contain at least one special character."
    ),
  confirmPassword: Yup.string()
    .required("The Confirm Password field is required.")
    .oneOf([Yup.ref("password"), null], "Passwords must match."),
});

export const shopInfoSchema = Yup.object().shape({
  shopLogo: Yup.array().nullable(),
  businessLicense: Yup.array()
  .test( "fileCount", "You can upload a maximum of 5 files.", (value) => value && value.length <= 5 )
  .test( "atLeastOneFile", "At least one business license is required.", (value) => value && value.length >= 1 ),
  shopName: Yup.string().required("The Shop name field is required."),
  shopContactNo: Yup.string().nullable()
  .matches( /^(\+?\d{1,4})?\d{7,12}$/, "The phone number format is invalid." )
  .test( "valid-length", "The phone number format is invalid.",
    (value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      if (value.startsWith("09")) {
        return digits.length === 11;
      }
      if (value.startsWith("+")) {
        return digits.length >= 10 && digits.length <= 12;
      }
      return false; 
    }
  ).test( "starts-with", "Invalid phone number format.", (value) => !value || value.startsWith("09") || value.startsWith("+") ),
  shopEmail: Yup.string().nullable().email("The email format is invalid."),
  openingTime: Yup.string().required("The Opening time field is required."),
  closingTime: Yup.string().required("The Closing time field is required."),
  buildingNo: Yup.string().nullable(),
  street: Yup.string().nullable(),
  barangay: Yup.string().required("The Barangay field is required."),
  municipality: Yup.string().required("The Municipality field is required."),
  province: Yup.string().required("The Province field is required."),
  postalNumber: Yup.string().required("The Postal number field is required."),
  googleMapPlaceName: Yup.string().nullable(),
  latitude: Yup.number().required("Latitude is required."),
  longitude: Yup.number().required("Longitude is required."),
});

export const manageShopRequestSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(["ACTIVE", "REJECTED", "PENDING"], "Please choose between PENDING, ACCEPTED or REJECTED status to submit")
    .required("Status is required"),
  message: Yup.string()
    .required("Message is required"),
});

Yup.addMethod(Yup.array, 'unique', function (field, message) {
  return this.test('unique', message, function (list) {
    if (!list) return true; // If list is undefined or null, don't validate
    const seen = new Set();
    const isUnique = list.every(item => {
      const identifier = item[field];
      if (seen.has(identifier)) return false;
      seen.add(identifier);
      return true;
    });
    return isUnique;
  });
});

const measurementValueSchema = Yup.object().shape({
  size: Yup.string().required(),
  value: Yup.number()
    .transform((val, origVal) => (origVal.trim() === "" ? undefined : val))
    .typeError("Measurement value must be a number.")
    .positive("Measurement value must be greater than 0.")
    .required("Measurement value is required."),
});

const measurementsSchema = Yup.array().of(
  Yup.object().shape({
    measurementName: Yup.string().required("Measurement name is required."),
    values: Yup.array().of(measurementValueSchema)
      .min(1, "At least one measurement value is required.")
  })
).min(1, "At least one measurement is required.");

const quantitySchema = Yup.object().shape({
  size: Yup.string().required(),
  quantity: Yup.number()
    .transform((val, origVal) => origVal.trim() === '' ? undefined : val)
    .typeError("Quantity must be a number")
    .integer("Quantity must be a whole number.")
    .positive("Quantity must be greater than 0.")
    .required("Quantity is required.")
});

const variantsSchema = Yup.array()
  .of(
    Yup.object().shape({
      price: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" ? undefined : value
        )
        .typeError("Price must be a number.")
        .positive("Price must be a positive number.")
        .required("Price is required."),
      color: Yup.string().required("Color is required."),
      sizes: Yup.array()
        .of(Yup.string().required())
        .min(1, "At least one size is required."),
      images: Yup.array()
        .of(
          Yup.object().shape({
            file: Yup.mixed().required("Image file is required."),
            url: Yup.string().required("Image url is required."),
          })
        )
        .min(1, "At least one image is required."),
      quantities: Yup.array()
        .of(quantitySchema)
        .min(1, "At least one quantity is required."),
      pngClothe: Yup.mixed()
        .nullable()
        .test(
          "pngClothe-required",
          "PNG clothe is required.",
          function (value) {
            const { path, createError, options, parent } = this;
            // Retrieve typeName either from context or from the parent object
            const typeName = options.context?.typeName || parent.type;
            // Only enforce requirement if the type is one of these
            if (["UPPERWEAR", "OUTERWEAR", "LOWERWEAR"].includes(typeName)) {
              // Expect the value to be an object with a truthy "url" property.
              if (!value || typeof value !== "object" || !value.url) {
                return createError({
                  path,
                  message: "PNG clothe is required.",
                });
              }
            }
            return true;
          }
        ),
    })
  )
  .min(1, "At least one variant of the product is added.");


export const productSchema = Yup.object().shape({
  thumbnail: Yup.object()
    .shape({
      file: Yup.mixed().required("Thumbnail is required."),
    })
    .required("Thumbnail is required."),
  name: Yup.string().required("Name is required."),
  description: Yup.string().nullable(),
  type: Yup.string().required("Type is required."), // expect type id or type name here
  category: Yup.string().required("Category is required."),
  tags: Yup.string().required("Tag is required."),
  sizes: Yup.array()
    .of(Yup.string().required())
    .min(1, "At least one size for the product is added."),
  measurements: measurementsSchema,
  variants: variantsSchema,
});

const editVariantsSchema = Yup.array()
  .of(
    Yup.object().shape({
      price: Yup.number()
        .transform((value, originalValue) =>
          originalValue === "" ? undefined : value
        )
        .typeError("Price must be a number.")
        .positive("Price must be a positive number.")
        .required("Price is required."),
      images: Yup.array()
        .of(
          Yup.object().shape({
            file: Yup.mixed().test(
              "fileOrUrl",
              "Image file is required.",
              function (value) {
                const { url } = this.parent;
                if (!url && !value) {
                  return false;
                }
                return true;
              }
            ),
            url: Yup.string().test(
              "urlOrFile",
              "Image url is required.",
              function (value) {
                const { file } = this.parent;
                if (!file && !value) {
                  return false;
                }
                return true;
              }
            ),
          })
        )
        .min(1, "At least one image is required."),
      pngClothe: Yup.mixed()
        .nullable()
        .test(
          "pngClothe-required",
          "PNG clothe is required.",
          function (value) {
            const { path, createError, options, parent } = this;
            const typeName = options.context?.typeName || parent.type;
            if (["UPPERWEAR", "OUTERWEAR", "LOWERWEAR"].includes(typeName)) {
              if (!value || typeof value !== "object" || !value.url) {
                return createError({
                  path,
                  message: "PNG clothe is required.",
                });
              }
            }
            return true;
          }
        ),
    })
  )
  .min(1, "At least one variant of the product is added.");

export const editProductSchema = Yup.object().shape({
  thumbnail: Yup.mixed()
    .test(
      "file-or-url",
      "Thumbnail must be a valid image file or URL.",
      (value) => {
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        if (value && typeof value === "object") {
          if (value.file instanceof File) return true;
          if (typeof value.url === "string" && value.url.trim() !== "")
            return true;
        }
        return false;
      }
    )
    .required("Thumbnail is required."),
  name: Yup.string().required("Name is required."),
  description: Yup.string().nullable(),
  measurements: measurementsSchema,
  variants: editVariantsSchema,
});

export const addSizeSchema = Yup.object({
  name: Yup.string().required("Size name is required."),
  abbreviation: Yup.string().required("An Abbreviation is required."),
  nextTo: Yup.string().nullable(),
});

export const addTypeSchema = Yup.object({
  name: Yup.string().required("Type name is required"),
});

export const addCategorySchema = Yup.object({
  name: Yup.string().required("Category name is required."),
});

export const addTagSchema = Yup.object({
  name: Yup.string().required("Tag name is required"),
  typeName: Yup.string().required("Type is required"),
});

export const addColorSchema = Yup.object({
  name: Yup.string().required("Color name is required"),
  hexCode: Yup.string()
    .matches(/^#[0-9A-F]{6}$/i, "Hex code must be a valid color code")
    .required("Hex code is required"),
});

export const addMeasurementSchema = Yup.object({
  name: Yup.string().required("Measurement name is required"),
  assignTo: Yup.string().required("You must assign to a clothing type"),
});

export const addUnitSchema = Yup.object({
  name: Yup.string().required("Unit name is required"),
  abbreviation: Yup.string()
    .max(10, "Abbreviation must be 10 characters or less")
    .required("Abbreviation is required"),
});

export const editUserSchema = (role) => 
Yup.object().shape({
  username: Yup.string().required("Username is required."),
  email: role === "VENDOR" 
    ? Yup.string().email("Invalid email format").required("Email is required.")
    : Yup.string().email("Invalid email format"), // Optional for admins
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  contactNo: role === "VENDOR" 
    ? Yup.string()
        .matches(/^\d+$/, "Contact number must be numeric.")
        .required("Contact number is required.")
    : Yup.string().matches(/^\d+$/, "Contact number must be numeric."), // Optional for admins
});