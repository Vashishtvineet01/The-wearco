import Link from "next/link";
import PageHero from "@/components/PageHero";

export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-2xl px-5 py-16 lg:px-8 lg:py-24">
      <PageHero
        eyebrow="404"
        title={
          <>
            This drop doesn&apos;t{" "}
            <span className="gradient-text">exist.</span>
          </>
        }
        subtitle="The page you're looking for shipped elsewhere — or never launched. Head back to the shop or start a custom print."
        spotlight="violet"
        center
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Shop the drops
          </Link>
          <Link href="/" className="btn-ghost">
            Back home
          </Link>
        </div>
      </PageHero>
    </div>
  );
}
