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

export const partnershipRequestSchema = Yup.object({
  firstName: Yup.string().required("First name is required."),
  lastName: Yup.string().required("Last name is required."),
  contactNo: Yup.string().required("Contact number is required."),
  email: Yup.string().email("Invalid email format.").required("Email is required."),
  position: Yup.string().required("Position is required."),
  businessLicense: Yup.mixed()
    .required("Business license is required.")
    .test(
      "fileSize",
      "File size must be less than or equal to 20 MB",
      (value) => !value || (value && value.size <= 20 * 1024 * 1024)
    )
    .test(
      "fileType",
      "File must be an image (jpg, jpeg, png, webp) or PDF",
      (value) =>
        !value || (value && ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(value.type))
    ),
  shopName: Yup.string().required("Shop name is required."),
  shopContactNo: Yup.string().required("Shop contact number is required."),
  buildingNo: Yup.string().nullable(),
  street: Yup.string().nullable(),
  barangay: Yup.string().required("Barangay is required."),
  municipality: Yup.string().required("Municipality is required."),
  province: Yup.string().required("Province is required."),
  postalNumber: Yup.string().required("Postal number is required."),
  googleMapPlaceName: Yup.string().nullable(),
  longitude: Yup.number().nullable(),
  latitude: Yup.number().nullable(),
});

export const manageShopRequestSchema = Yup.object().shape({
  status: Yup.string().required("Status is required"),
  username: Yup.lazy((value) =>
    value === "ACTIVE"
      ? Yup.string().required("Username is required")
      : Yup.string().notRequired()
  ),
  password: Yup.lazy((value) =>
    value === "ACTIVE"
      ? Yup.string().required("Password is required")
      : Yup.string().notRequired()
  ),
});
