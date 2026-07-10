import { Suspense } from 'react';
import { GuestOnly } from '@/components/auth/GuestOnly';
import { LoginForm } from '@/components/auth/LoginForm';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  return (
    <GuestOnly>
      <Suspense
        fallback={
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-10 w-48 mx-auto" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </GuestOnly>
  );
}
