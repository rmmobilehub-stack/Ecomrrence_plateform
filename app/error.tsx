'use client';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <main className="not-found"><h1>Something went wrong</h1><p>We could not load this page. Please try again.</p><button className="btn btn-primary" onClick={reset}>Try again</button></main>; }
