import AuthShell from "@/components/AuthShell";
import SignupForm from "./SignupForm";

export const metadata = {
  title: "Create an account",
  description: "Create an account to share IIIT Hyderabad course resources.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes a minute, and you can start contributing right away."
      aside={{
        title: "Built by students, for students.",
        text: "Every course page is filled in by the people who took it. Add what helped you and it stays there for the next batch.",
        points: ["Free for everyone at IIIT-H", "Credit on everything you post", "Edit or remove your posts any time"],
      }}
    >
      <SignupForm />
    </AuthShell>
  );
}
