import { redirect } from "next/navigation";

export default function BroadcastRedirect() {
  redirect("/admin/notifications");
}
