import { redirect } from "next/navigation";

export default function Home({ searchParams }) {
  const params = new URLSearchParams(searchParams);
  redirect(`/dashboard?${params.toString()}`);
}
