// hooks/useProducts.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { buildApiUrl } from "../utils/helpers";
import { EXPO_PUBLIC_API_URL } from "@env";

type ProductDto = {
  id: number;
  thumbnailURL: string;
  productName: string;
  price: string;
};

type ProductsResponse = {
  products: ProductDto[];
};

export function useProducts({
  search = "",
  filters = ["ALL CLOTHINGS"],
}: {
  search?: string;
  filters?: string[];
}) {
  return useInfiniteQuery<ProductsResponse, Error>({
    queryKey: ["products", { search, filters }],
    // tell it where to start
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      // pageParam is now guaranteed to be number
      const typeParam = filters.includes("ALL CLOTHINGS")
        ? undefined
        : filters.join(",");
      const url = buildApiUrl(
        EXPO_PUBLIC_API_URL,
        "/api/mobile/home/get-products",
        {
          limit: 10,
          page: pageParam,
          ...(search ? { search } : {}),
          ...(typeParam ? { type: typeParam } : {}),
        }
      );
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return (await res.json()) as ProductsResponse;
    },
    getNextPageParam: (lastPage, allPages) => {
      // if we got a full “page” of results, there might be more
      return lastPage.products.length === 10 ? allPages.length + 1 : undefined;
    },
  });
}
