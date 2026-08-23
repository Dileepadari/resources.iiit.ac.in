import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign in",
  description: "Sign in to browse and share IIIT Hyderabad course resources.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to browse and contribute course material."
      aside={{
        title: "Everything for your semester, in one place.",
        text: "Notes, slides, past papers and lecture recordings, contributed and ranked by students who took the course.",
        points: ["Search across every course", "Upvote what actually helped", "Add your own material"],
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
