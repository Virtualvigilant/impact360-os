import { CardsSkeleton, ListSkeleton } from '@/components/primitives/states';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-7">
            <div className="space-y-3 border-b pb-7">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <CardsSkeleton />
            <ListSkeleton />
        </div>
    );
}
