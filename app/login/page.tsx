import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import BrandLoader from "@/components/BrandLoader";

export const metadata = {
  title: "Login / Signup — TheWearCo",
  description:
    "Login or signup with mobile OTP. Email and guest checkout also available.",
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
