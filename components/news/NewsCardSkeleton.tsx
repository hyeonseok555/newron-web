import { Skeleton } from "@/components/ui/skeleton";

export function NewsCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/20 flex flex-col">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-card-padding flex flex-col flex-grow gap-stack-sm">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto pt-stack-md border-t border-outline-variant/30">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
