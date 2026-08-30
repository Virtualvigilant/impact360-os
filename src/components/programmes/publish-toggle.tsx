'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { publishOpportunity } from '@/lib/actions/recruitment';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Publishing puts the opportunity on the public internet and opens the application
 * form, so it confirms first. Unpublishing is equally consequential — a candidate
 * halfway through an application loses the page.
 */
export function PublishToggle({ opportunityId, published }: { opportunityId: string; published: boolean }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    function toggle() {
        startTransition(async () => {
            const result = await publishOpportunity(opportunityId, !published);
            if (result.ok) {
                toast.success(published ? 'Returned to draft' : 'Published to the public catalogue');
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={published ? 'outline' : 'default'} size="sm">
                    {published ? 'Unpublish' : 'Publish'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{published ? 'Return this to draft?' : 'Publish this opportunity?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {published
                            ? 'It disappears from the public catalogue immediately. Anyone part-way through an application will lose the page. Applications already submitted are kept.'
                            : 'It becomes visible on the public catalogue and the application form opens. Check the summary, responsibilities and closing date first.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(event) => { event.preventDefault(); toggle(); }} disabled={pending}>
                        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                        {published ? 'Unpublish' : 'Publish'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
