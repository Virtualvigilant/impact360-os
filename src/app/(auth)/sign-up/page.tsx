import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details to join Impact360 OS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}