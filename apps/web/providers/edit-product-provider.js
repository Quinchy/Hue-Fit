// File: /providers/edit-product-provider.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/ui/loading";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import useSWR from "swr";

const EditProductContext = createContext();

export const EditProductProvider = ({ children }) => {
  const router = useRouter();
  const { productNo } = router.query;
  const [productDetails, setProductDetails] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(true);

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data } = useSWR(
    productNo
      ? `/api/products/get-product-details?productNo=${productNo}`
      : null,
    fetcher
  );

  useEffect(() => {
    if (data && data.product) {
      setProductDetails(data.product);
      setGlobalLoading(false);
    }
  }, [data]);

  if (globalLoading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading product..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <EditProductContext.Provider value={{ productDetails, setProductDetails }}>
      {children}
    </EditProductContext.Provider>
  );
};

export const useEditProduct = () => useContext(EditProductContext);

export default EditProductProvider;
