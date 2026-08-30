import { redirect } from "next/navigation";

export default function Home() {
  // The dashboard guard sends signed-out visitors to /login.
  redirect("/dashboard");
}
