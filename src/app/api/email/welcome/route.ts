import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildWelcomeEmail } from "@/lib/emails/welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, firstName, businessName } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
    : "http://localhost:3000/dashboard";

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "ClozeFlow <hello@clozeflow.com>",
    to: process.env.RESEND_TEST_TO ?? email,
    subject: "You're in — ClozeFlow is responding to leads right now ⚡",
    html: buildWelcomeEmail({ firstName, businessName, dashboardUrl }),
  });

  if (error) {
    console.error("[welcome-email]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
