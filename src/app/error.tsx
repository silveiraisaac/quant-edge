'use client';
export default function ErrorPage({retry}:{retry:()=>void}) {
  return <main className="mx-auto max-w-xl space-y-4 p-8" role="alert"><h1 className="text-xl font-semibold">Unable to display this page</h1><p>Your saved configurations have not been changed. Try loading the page again.</p><button className="rounded bg-teal-700 px-4 py-2 text-white" onClick={()=>retry()}>Try again</button></main>;
}
