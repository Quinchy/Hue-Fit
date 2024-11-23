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
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  contactNo: Yup.string().required("Contact number is required."),
  email: Yup.string().email("Invalid email format.").required("Email is required."),
  position: Yup.string().required("Position is required."),
});

export const shopInfoSchema = Yup.object({
  businessLicense: Yup.array()
  .test(
    "fileCount",
    "You can upload a maximum of 5 files.",
    (value) => value && value.length <= 5
  )
  .test(
    "atLeastOneFile",
    "At least one business license is required.",
    (value) => value && value.length >= 1
  ),
  shopName: Yup.string().required("Shop name is required."),
  shopContactNo: Yup.string().required("Shop contact number is required."),
  buildingNo: Yup.string().nullable(),
  street: Yup.string().nullable(),
  barangay: Yup.string().required("Barangay is required."),
  municipality: Yup.string().required("Municipality is required."),
  province: Yup.string().required("Province is required."),
  postalNumber: Yup.string().required("Postal number is required."),
});

export const accountInfoSchema = Yup.object({
  username: Yup.string().required("Username is required."),
  password: Yup.string().required("Password is required."),
});

export const locationInfoSchema = Yup.object().shape({
  googleMapPlaceName: Yup.string().nullable(),
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
}).test(
  'location-selected',
  'You should mark the location of your shop on the Google Map or enter your registered Google Map Location on map picker.',
  function (value) {
    const { latitude, longitude } = value;
    // Check if both latitude and longitude are not null
    return latitude != null && longitude != null;
  }
);

export const manageShopRequestSchema = Yup.object().shape({
  status: Yup.string()
    .oneOf(["ACTIVE", "REJECTED"], "Please choose between ACTIVE or REJECTED status to submit")
    .required("Status is required"),
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

export const coreProductSchema = Yup.object({
  thumbnail: Yup.mixed().required("Product image thumbnail is required."),
  name: Yup.string().required("Product name is required."),
  description: Yup.string().nullable(),
  type: Yup.string().required("Product type is required."),
  category: Yup.string().required("Product category is required."),
});

const measurementSchema = Yup.object().shape({
  measurementName: Yup.string().required('Measurement is required'),
  value: Yup.number()
    .typeError('Value must be a number')
    .positive('Value must be greater than 0.')
    .required('Value is required'),
  unitName: Yup.string().required('Unit is required'),
});

const measurementsBySizeSchema = Yup.lazy((obj) =>
  Yup.object(
    Object.keys(obj || {}).reduce((acc, size) => {
      acc[size] = Yup.object().shape({
        measurements: Yup.array()
          .of(measurementSchema)
          .min(1, 'At least one measurement is required.'),
      });
      return acc;
    }, {})
  )
);

export const productVariantSchema = Yup.object().shape({
  price: Yup.number()
    .typeError("Price must be a number.")
    .positive("Price must be a positive number.")
    .required("Price is required."),
  color: Yup.string().required("Color is required."),
  sizes: Yup.array().of(Yup.string()).min(1, "At least one size is required."),
  quantities: Yup.lazy((value) => 
    Yup.object().shape(
      Object.keys(value || {}).reduce((acc, size) => {
        acc[size] = Yup.number()
          .typeError('Quantity must be a number')
          .integer('Quantity must be a whole number.')
          .positive('Quantity must be greater than 0.')
          .required('Quantity is required.');
        return acc;
      }, {})
    )
  ),
  images: Yup.array()
    .of(Yup.object().shape({
      id: Yup.string().required(),
      file: Yup.mixed().required('Image file is required'),
      url: Yup.string().required(),
    }))
    .min(1, 'At least one image is required.')
    .required('Product images are required.'),
});

export const productSchema = Yup.object({
  thumbnail: Yup.object()
    .shape({
      file: Yup.mixed()
        .required("Product image thumbnail is required.")
        .test(
          "fileType",
          "Unsupported file format",
          (value) =>
            value &&
            ["image/jpeg", "image/png", "image/jpg"].includes(value.type)
        )
        .test(
          "fileSize",
          "File size is too large (max 5MB).",
          (value) => value && value.size <= 5 * 1024 * 1024
        ),
      url: Yup.string().required("Thumbnail preview URL is required."),
      id: Yup.string().required("Thumbnail unique ID is required."),
    })
    .required("Thumbnail object is required."),
  name: Yup.string().required("Product name is required."),
  description: Yup.string().nullable(),
  type: Yup.string().required("Product type is required."),
  category: Yup.string().required("Product category is required."),
  tags: Yup.string().required("Product tags is required."),
  variants: Yup.array()
    .of(productVariantSchema)
    .min(1, "At least one product variant is required."),
  measurementsBySize: measurementsBySizeSchema,
});

export const addSizeSchema = Yup.object({
  name: Yup.string().required("The Size Name field is required."),
  abbreviation: Yup.string().required("The Abbreviation field is required."),
  nextTo: Yup.string().nullable(),
});

export const addTypeSchema = Yup.object({
  name: Yup.string().required("Type Name is required"),
});

export const addCategorySchema = Yup.object({
  name: Yup.string().required("Category name is required."),
});

export const addTagSchema = Yup.object({
  name: Yup.string().required("Tag Name is required"),
  typeName: Yup.string().required("Type is required"),
});

export const colorSchema = Yup.object({
  name: Yup.string().required("Color name is required"),
  hexCode: Yup.string()
    .matches(/^#[0-9A-F]{6}$/i, "Hex code must be a valid color code")
    .required("Hex code is required"),
});