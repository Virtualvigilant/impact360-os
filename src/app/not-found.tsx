import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="grid min-h-screen place-items-center p-6">
            <div className="max-w-md text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
                    <FileQuestion className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <h1 className="mt-5 text-xl font-semibold">Page not found</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    That address does not match anything here. It may have been part of the previous system, or the record
                    may have been removed.
                </p>
                <div className="mt-6 flex justify-center gap-2">
                    <Button asChild>
                        <Link href="/dashboard">Go to the dashboard</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/opportunities">Browse opportunities</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
