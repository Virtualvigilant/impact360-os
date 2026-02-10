import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-6xl font-bold tracking-tight">
          Impact360 OS
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl">
          A systematic talent development platform that transforms community members
          into client-ready, high-performing professionals.
        </p>
        <div className="flex gap-4 justify-center pt-8">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}