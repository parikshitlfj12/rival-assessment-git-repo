"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_TASK_LIMIT,
  DEFAULT_TASK_ORDER,
  DEFAULT_TASK_SORT,
} from "@/constants/tasks";
import { buildTaskListQuery } from "@/lib/task-query";

type UseTaskListParamsOptions = {
  basePath: string;
};

export function useTaskListParams({ basePath }: UseTaskListParamsOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const didSyncDefaults = useRef(false);

  const sort = searchParams.get("sort") ?? DEFAULT_TASK_SORT;
  const order = searchParams.get("order") ?? DEFAULT_TASK_ORDER;
  const status = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const listQueryString = buildTaskListQuery(searchParams);

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

  // Keep URL aligned with API defaults (newest first, 10 per page).
  useEffect(() => {
    if (didSyncDefaults.current) return;
    const missingSort = !searchParams.has("sort");
    const missingOrder = !searchParams.has("order");
    const missingLimit = !searchParams.has("limit");
    if (missingSort || missingOrder || missingLimit) {
      didSyncDefaults.current = true;
      updateParams({
        sort: searchParams.get("sort") ?? DEFAULT_TASK_SORT,
        order: searchParams.get("order") ?? DEFAULT_TASK_ORDER,
        limit: searchParams.get("limit") ?? String(DEFAULT_TASK_LIMIT),
      });
    }
  }, [searchParams, updateParams]);

  useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (searchInput !== current) {
        updateParams({ search: searchInput || null, page: "1" });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, searchParams, updateParams]);

  return {
    searchInput,
    setSearchInput,
    updateParams,
    page,
    sort,
    order,
    status,
    listQueryString,
  };
}
