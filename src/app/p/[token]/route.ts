import { redirect } from "next/navigation";

/** Short URL alias: /p/[token] → /project/[token] */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  redirect(`/project/${token}`);
}
