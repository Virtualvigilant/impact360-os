'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { humanise } from '@/lib/utils/format';

export interface FilterOption {
    /** The query-string key, e.g. `status`. */
    param: string;
    label: string;
    options: readonly string[];
}

/**
 * Search and filters, held in the URL.
 *
 * Searching used to happen in the browser over whatever page happened to be loaded, so
 * a search for an intern who was on page three found nothing. The term now round-trips
 * to Postgres, debounced, and any change resets to page one — staying on page 7 of a
 * new, shorter result set shows an empty screen.
 */
export function FilterBar({
    searchPlaceholder = 'Search…',
    filters = [],
}: {
    searchPlaceholder?: string;
    filters?: readonly FilterOption[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [term, setTerm] = useState(searchParams.get('q') ?? '');

    // Keep the box in step when the URL changes from elsewhere (back button, a reset).
    useEffect(() => setTerm(searchParams.get('q') ?? ''), [searchParams]);

    function apply(mutate: (params: URLSearchParams) => void) {
        const params = new URLSearchParams(searchParams.toString());
        mutate(params);
        params.delete('page');
        startTransition(() => router.push(`${pathname}${params.size ? `?${params}` : ''}`));
    }

    useEffect(() => {
        const current = searchParams.get('q') ?? '';
        if (term === current) return;
        const timer = setTimeout(() => {
            apply((params) => (term ? params.set('q', term) : params.delete('q')));
        }, 300);
        return () => clearTimeout(timer);
        // `apply` is stable enough for this purpose; re-running on it would defeat the debounce.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [term]);

    const active = filters.some((filter) => searchParams.get(filter.param)) || Boolean(searchParams.get('q'));

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    className="pl-9"
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                />
                {isPending && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
                )}
            </div>

            {filters.map((filter) => (
                <select
                    key={filter.param}
                    aria-label={filter.label}
                    value={searchParams.get(filter.param) ?? ''}
                    onChange={(event) =>
                        apply((params) =>
                            event.target.value ? params.set(filter.param, event.target.value) : params.delete(filter.param),
                        )
                    }
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="">All {filter.label.toLowerCase()}</option>
                    {filter.options.map((option) => (
                        <option key={option} value={option}>
                            {humanise(option)}
                        </option>
                    ))}
                </select>
            ))}

            {active && (
                <Button variant="ghost" size="sm" onClick={() => apply((params) => [...params.keys()].forEach((key) => params.delete(key)))}>
                    <X className="mr-1 h-4 w-4" aria-hidden />
                    Clear
                </Button>
            )}
        </div>
    );
}
