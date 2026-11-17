import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import BrandLoader from "@/components/BrandLoader";

export const metadata = {
  title: "Sign in — TheWearCo",
  description:
    "Sign in with phone OTP or email and password. Guest checkout still available.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <BrandLoader eyebrow="Sign in" title="Warming up your mobile login." />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
