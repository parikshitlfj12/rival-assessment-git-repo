import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function SignupPage() {
  return (
    <AuthLayout title="Create account" description="Start organizing your tasks in minutes.">
      <SignupForm />
    </AuthLayout>
  );
}
