import Profile from "./pages/dashboard/profile";

// routes.js
const routes = {
  home: '/',
  about: '/about',
  contact: '/contact',
  virtualFittingMobile: '/virtual-try-on',
  partnership: '/vendor-register',
  shopSetup: '/partnership/setup/setup-shop',
  shopSuccess: '/partnership/setup/success',
  shopStatus: '/partnership/status/status-shop',
  account: '/account',
  login: '/account/login',
  forgotPassword: '/account/forgot-password',
  dashboard: '/dashboard',
  notification: '/dashboard/notification',
  profile: '/dashboard/profile',
  shopProfile: '/dashboard/shop-profile',
  settings: '/dashboard/settings',
  shop: '/dashboard/shop',
  shopAdd: '/dashboard/shop/add',
  shopEdit: '/dashboard/shop/edit/[shopNo]',
  shopView: '/dashboard/shop/view/[shopNo]',
  shopRequest: '/dashboard/shop/requests',
  shopRequestManage: '/dashboard/shop/requests/manage/[requestNo]',
  inquiry: '/dashboard/inquiry',
  inquiryView: '/dashboard/inquiry/view/[inquiryNo]',
  product: '/dashboard/product',
  archivedProduct: '/dashboard/product/archived',
  productAdd: '/dashboard/product/add',
  productEdit: '/dashboard/product/edit/[productNo]',
  productStock: '/dashboard/product/stock/[productNo]',
  productView: '/dashboard/product/view/[productNo]',
  order: '/dashboard/order',
  orderAdd: '/dashboard/order/add/[orderNo]',
  orderEdit: '/dashboard/order/edit/[orderNo]',
  orderView: '/dashboard/order/view/[orderNo]',
  orderReserve: '/dashboard/order/reserve',
  orderReserveAdd: '/dashboard/order/reserve/add/[orderNo]',
  orderReserveEdit: '/dashboard/order/reserve/edit/[orderNo]',
  orderReserveView: '/dashboard/order/reserve/view/[orderNo]',
  manageFee: '/dashboard/order/manage-fee',
  user: '/dashboard/user',
  userAdd: '/dashboard/user/add',
  userEdit: '/dashboard/user/edit/[userNo]',
  userView: '/dashboard/user/view/[userNo]',
  maintenance: '/dashboard/maintenance',
  types: '/dashboard/maintenance/types',
  typesAdd: '/dashboard/maintenance/types/add/[typeNo]',
  categories: '/dashboard/maintenance/categories',
  categoriesAdd: '/dashboard/maintenance/categories/add/[categoryNo]',
  tags: '/dashboard/maintenance/tags',
  tagsAdd: '/dashboard/maintenance/tags/add/[tagNo]',
  colors: '/dashboard/maintenance/colors',
  colorsAdd: '/dashboard/maintenance/colors/add/[colorNo]',
  measurements: '/dashboard/maintenance/measurements',
  measurementsAdd: '/dashboard/maintenance/measurements/add/[measurementNo]',
  units: '/dashboard/maintenance/units',
  unitsAdd: '/dashboard/maintenance/units/add/[unitNo]',
  sizes: '/dashboard/maintenance/sizes',
  sizesAdd: '/dashboard/maintenance/sizes/add/[unitNo]',
  virtualFitting: '/dashboard/virtual-fitting',
  addVirtualFitting: '/dashboard/virtual-fitting/add',
  virtualTryOn: '/dashboard/virtual-fitting/virtual-try-on',
  aiTryOn: '/dashboard/virtual-fitting/ai-try-on',
};

export default routes;