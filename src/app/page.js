import { redirect } from "next/navigation";

export default function Home() {
  redirect("/home"); // Automatically redirects to the home page
  return null;
}
