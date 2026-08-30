import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-sm">
                <Image
                    src="/logo.png"
                    alt="Impact 360 Logo"
                    width={36}
                    height={36}
                    className="h-full w-full object-contain p-0.5"
                    priority
                />
            </div>
            {!compact && (
                <div className="leading-none">
                    <div className="font-heading text-base font-black tracking-[0.08em]">IMPACT 360</div>
                    <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Internship OS
                    </div>
                </div>
            )}
        </div>
    );
}

