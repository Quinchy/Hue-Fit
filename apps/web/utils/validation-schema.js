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