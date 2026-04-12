import { redirect } from "next/navigation";

/** Short URL alias: /b → /book */
export async function GET() {
  redirect("/book");
}
