// utils/helpers.ts

export type ApiParams = {
  limit?: number;
  page?: number;
  order?: string;
  filter?: string | string[];
  [key: string]: string | number | boolean | string[] | undefined;
};

export function buildApiUrl(
  baseUrl: string,
  apiRoute: string,
  params?: ApiParams
): string {
  // new URL(route, base) correctly handles slashes
  const url = new URL(apiRoute, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      let out: string;
      if (Array.isArray(value)) {
        out = value.join(",");
      } else {
        out = String(value);
      }

      url.searchParams.set(key, out);
    });
  }

  return url.toString();
}
