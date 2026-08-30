'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ActionResult } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * A form that submits to a server action and renders its field errors.
 *
 * Forms previously read `FormData` and inserted straight into Supabase from the
 * browser, so the only feedback on a bad value was a toast containing a Postgres
 * constraint name. Validation now runs server-side against a zod schema and the errors
 * come back keyed by field.
 */
export function ActionForm({
    action,
    children,
    submitLabel,
    successMessage,
    onSuccess,
    className,
}: {
    action: (input: unknown) => Promise<ActionResult<unknown>>;
    children: (errors: Record<string, string[]>) => ReactNode;
    submitLabel: string;
    successMessage: string;
    onSuccess?: () => void;
    className?: string;
}) {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setErrors({});

        const formData = new FormData(event.currentTarget);
        const input: Record<string, unknown> = {};
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) continue;
            input[key] = value;
        }
        // An unchecked checkbox is absent from FormData; zod needs to see the false.
        for (const element of Array.from(event.currentTarget.elements)) {
            if (element instanceof HTMLInputElement && element.type === 'checkbox' && element.name) {
                input[element.name] = element.checked;
            }
        }

        const result = await action(input);
        setPending(false);

        if (result.ok) {
            toast.success(successMessage);
            onSuccess?.();
            router.refresh();
        } else {
            setErrors(result.fieldErrors ?? {});
            toast.error(result.error);
        }
    }

    return (
        <form onSubmit={onSubmit} className={cn('space-y-5', className)} noValidate>
            {children(errors)}
            {errors._form?.map((message) => (
                <p key={message} className="text-sm text-destructive">
                    {message}
                </p>
            ))}
            <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                {submitLabel}
            </Button>
        </form>
    );
}

/** The same thing inside a dialog, which is how most creation flows are presented. */
export function ActionDialog({
    trigger,
    title,
    description,
    action,
    children,
    submitLabel,
    successMessage,
}: {
    trigger: ReactNode;
    title: string;
    description: string;
    action: (input: unknown) => Promise<ActionResult<unknown>>;
    children: (errors: Record<string, string[]>) => ReactNode;
    submitLabel: string;
    successMessage: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <ActionForm
                    action={action}
                    submitLabel={submitLabel}
                    successMessage={successMessage}
                    onSuccess={() => setOpen(false)}
                >
                    {children}
                </ActionForm>
            </DialogContent>
        </Dialog>
    );
}

// ─── Field primitives that render their own errors ───────────────────────────

interface FieldProps {
    name: string;
    label: string;
    errors: Record<string, string[]>;
    hint?: string;
    required?: boolean;
    defaultValue?: string | number;
}

function FieldShell({
    name,
    label,
    errors,
    hint,
    required,
    children,
}: FieldProps & { children: ReactNode }) {
    const messages = errors[name];
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            {children}
            {hint && !messages ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
            {messages?.map((message) => (
                <p key={message} id={`${name}-error`} className="text-xs text-destructive">
                    {message}
                </p>
            ))}
        </div>
    );
}

export function TextField({ type = 'text', ...props }: FieldProps & { type?: string }) {
    const invalid = Boolean(props.errors[props.name]);
    return (
        <FieldShell {...props}>
            <Input
                id={props.name}
                name={props.name}
                type={type}
                defaultValue={props.defaultValue}
                aria-invalid={invalid}
                aria-describedby={invalid ? `${props.name}-error` : undefined}
            />
        </FieldShell>
    );
}

export function AreaField({ rows = 3, ...props }: FieldProps & { rows?: number }) {
    const invalid = Boolean(props.errors[props.name]);
    return (
        <FieldShell {...props}>
            <Textarea
                id={props.name}
                name={props.name}
                rows={rows}
                defaultValue={props.defaultValue}
                aria-invalid={invalid}
                aria-describedby={invalid ? `${props.name}-error` : undefined}
            />
        </FieldShell>
    );
}

export function SelectField({
    options,
    ...props
}: FieldProps & { options: readonly { value: string; label: string }[] }) {
    return (
        <FieldShell {...props}>
            <select
                id={props.name}
                name={props.name}
                defaultValue={props.defaultValue}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                aria-invalid={Boolean(props.errors[props.name])}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FieldShell>
    );
}

export function CheckField({
    name,
    label,
    errors,
    hint,
    defaultChecked,
}: {
    name: string;
    label: string;
    errors: Record<string, string[]>;
    hint?: string;
    defaultChecked?: boolean;
}) {
    const messages = errors[name];
    return (
        <div className="space-y-1.5">
            <label className="flex items-start gap-2.5 text-sm">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    className="mt-0.5 h-4 w-4 rounded border-input"
                />
                <span className="leading-5">{label}</span>
            </label>
            {hint && !messages ? <p className="pl-7 text-xs text-muted-foreground">{hint}</p> : null}
            {messages?.map((message) => (
                <p key={message} className="pl-7 text-xs text-destructive">
                    {message}
                </p>
            ))}
        </div>
    );
}
