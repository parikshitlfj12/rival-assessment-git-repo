"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UseTaskListParamsOptions = {
  basePath: string;
};

export function useTaskListParams({ basePath }: UseTaskListParamsOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
    [basePath, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (searchInput !== current) {
        updateParams({ search: searchInput || null, page: "1" });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, updateParams]);

  const page = Number(searchParams.get("page") ?? "1");
  const sort = searchParams.get("sort") ?? "created_at";
  const order = searchParams.get("order") ?? "desc";
  const status = searchParams.get("status") ?? "";

  return {
    searchInput,
    setSearchInput,
    updateParams,
    page,
    sort,
    order,
    status,
  };
}
