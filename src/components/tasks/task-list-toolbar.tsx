"use client";

import { Search } from "lucide-react";
import { STATUS_FILTERS, SORT_OPTIONS, ORDER_OPTIONS } from "@/constants/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type TaskListToolbarProps = {
  status: string;
  sort: string;
  order: string;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string | null) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  trailing?: React.ReactNode;
};

export function TaskListToolbar({
  status,
  sort,
  order,
  searchInput,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onOrderChange,
  trailing,
}: TaskListToolbarProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.label}
              variant={status === filter.value ? "primary" : "ghost"}
              className="min-h-9 rounded-xl"
              onClick={() => onStatusChange(filter.value || null)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        {trailing}
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title…"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select value={order} onChange={(event) => onOrderChange(event.target.value)}>
          {ORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
