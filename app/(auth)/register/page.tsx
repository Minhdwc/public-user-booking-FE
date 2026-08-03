import { GuestOnly } from '@/components/features/auth/GuestOnly';
import { RegisterForm } from '@/components/features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  );
}
