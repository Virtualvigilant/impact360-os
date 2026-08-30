import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function PageHeader({
    eyebrow,
    title,
    description,
    icon: Icon,
    actions,
}: {
    eyebrow: string;
    title: string;
    description: string;
    icon: LucideIcon;
    actions?: ReactNode;
}) {
    return (
        <header className="flex flex-col gap-5 border-b pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {eyebrow}
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
    );
}
