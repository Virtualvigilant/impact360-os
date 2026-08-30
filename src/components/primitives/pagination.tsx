'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Page } from '@/lib/domain/paging';

/**
 * Paging through the URL, so a page of results is a link someone can send to a
 * colleague and the browser's back button behaves.
 */
export function Pagination<T>({ page, label = 'records' }: { page: Page<T>; label?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (page.pageCount <= 1) {
        return (
            <p className="text-xs text-muted-foreground">
                {page.total} {label}
            </p>
        );
    }

    function goTo(next: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (next <= 1) params.delete('page');
        else params.set('page', String(next));
        router.push(`${pathname}${params.size ? `?${params}` : ''}`);
    }

    const first = (page.page - 1) * page.pageSize + 1;
    const last = Math.min(page.page * page.pageSize, page.total);

    return (
        <div className="flex items-center justify-between gap-4 border-t pt-4">
            <p className="text-xs text-muted-foreground">
                {first}–{last} of {page.total} {label}
            </p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page.page <= 1} onClick={() => goTo(page.page - 1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
                    Previous
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                    {page.page} / {page.pageCount}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page.page >= page.pageCount}
                    onClick={() => goTo(page.page + 1)}
                >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                </Button>
            </div>
        </div>
    );
}
