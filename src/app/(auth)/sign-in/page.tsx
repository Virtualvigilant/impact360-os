import Link from 'next/link';
import { SignInForm } from '@/components/auth/SignInForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Impact360 OS account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}