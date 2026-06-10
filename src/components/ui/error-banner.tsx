import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm font-medium">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {message}
        </p>
        {onRetry ? (
          <Button variant="outline" className="shrink-0 border-destructive/30" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
