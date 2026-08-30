import { ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Shown when `proxy.ts` redirected someone away from a route their role does not open.
 * Says so plainly rather than pretending the page does not exist — a person who was
 * given the wrong link should be able to tell the difference and ask for access.
 */
export function AccessDeniedNotice() {
    return (
        <Alert>
            <ShieldAlert className="h-4 w-4" aria-hidden />
            <AlertTitle>That page is not open to your role</AlertTitle>
            <AlertDescription>
                You were returned here. If you need access, ask a programme administrator — roles are assigned by ITEK,
                and every change is recorded.
            </AlertDescription>
        </Alert>
    );
}
