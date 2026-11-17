import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import BrandLoader from "@/components/BrandLoader";

export const metadata = {
  title: "Sign in — TheWearCo",
  description: "Passwordless sign-in. No account needed to shop.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <BrandLoader eyebrow="Sign in" title="Warming up the magic link." />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
