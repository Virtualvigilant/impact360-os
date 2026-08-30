'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { visibleRoutes } from '@/lib/auth/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSession } from './session-provider';
import { cn } from '@/lib/utils';

/**
 * Ctrl/Cmd-K navigation.
 *
 * Reads the same route map as the sidebar, so the palette can never offer a
 * destination the person is not allowed to open — the previous version kept its own
 * hard-coded list with its own role strings, which had already drifted.
 */
export function CommandPalette() {
    const router = useRouter();
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlighted, setHighlighted] = useState(0);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setOpen((current) => !current);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const routes = useMemo(() => visibleRoutes(session.role), [session.role]);
    const results = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return routes;
        return routes.filter(
            (route) => route.title.toLowerCase().includes(term) || route.hint.toLowerCase().includes(term),
        );
    }, [routes, query]);

    // Clamped rather than reset in an effect: a filtered list can be shorter than the
    // index that was highlighted before typing, and an out-of-range index would make
    // Enter do nothing.
    const active = Math.min(highlighted, Math.max(results.length - 1, 0));

    function go(href: string) {
        setOpen(false);
        setQuery('');
        setHighlighted(0);
        router.push(href);
    }

    function onListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlighted(Math.min(active + 1, results.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlighted(Math.max(active - 1, 0));
        } else if (event.key === 'Enter' && results[active]) {
            event.preventDefault();
            go(results[active].href);
        }
    }

    return (
        <>
            <Button
                variant="outline"
                className="hidden h-9 w-56 justify-start gap-2 text-muted-foreground lg:flex"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4" aria-hidden />
                <span className="flex-1 text-left text-xs">Search or jump to…</span>
                <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Search">
                <Search className="h-4 w-4" aria-hidden />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="top-[30%] gap-0 overflow-hidden p-0 sm:max-w-xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Search ITEK Internship OS</DialogTitle>
                    </DialogHeader>
                    <div className="relative border-b">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            onKeyDown={onListKeyDown}
                            placeholder="Search modules…"
                            aria-label="Search modules"
                            className="h-14 rounded-none border-0 pl-11 shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                        {results.map((route, index) => {
                            const Icon = route.icon;
                            return (
                                <button
                                    key={route.href}
                                    type="button"
                                    onClick={() => go(route.href)}
                                    onMouseEnter={() => setHighlighted(index)}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm',
                                        index === active ? 'bg-muted' : 'hover:bg-muted/60',
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                    <span className="flex-1 truncate">{route.title}</span>
                                    <span className="hidden truncate text-xs text-muted-foreground sm:block">{route.hint}</span>
                                </button>
                            );
                        })}
                        {results.length === 0 && (
                            <p className="p-6 text-center text-sm text-muted-foreground">No matching destination.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
