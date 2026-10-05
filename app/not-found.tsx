import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-28 text-center">
      <p className="font-mono text-sm text-accent">HTTP/1.1 404 Not Found</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">This page didn&apos;t make it through.</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">
        The request reached us, but there&apos;s nothing at this path. It may have moved, or never existed.
      </p>
      <Link
        href="/"
        className="bg-brand mt-8 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-transform hover:-translate-y-0.5"
      >
        Back to the ledger
      </Link>
    </div>
  );
}
