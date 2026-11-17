import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import BrandLoader from "@/components/BrandLoader";

export const metadata = {
  title: "Sign in — TheWearCo",
  description:
    "Sign in with email and password, or a one-time email code. Guest checkout still available.",
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
