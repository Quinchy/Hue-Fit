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
  )
  .test(
    "fileProperties",
    "Each file must be a valid URL.",
    (value) =>
      value &&
      value.every(
        (url) => typeof url === "string" && url.startsWith("https") // Simple check to ensure it's a URL
      )
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