import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in" description="Welcome back. Enter your credentials to continue.">
      <LoginForm />
    </AuthLayout>
  );
}
