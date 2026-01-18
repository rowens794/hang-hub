import { getChildrenAction, getPendingHangApprovals, getHangHistory } from "@/lib/actions.parent";
import { logout } from "@/lib/actions.auth";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddChildForm from "./AddChildForm";
import ChildCard from "./ChildCard";
import PendingApprovals from "./PendingApprovals";
import HangHistory from "./HangHistory";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function ParentDashboard() {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    redirect("/login");
  }

  const children = await getChildrenAction();
  const pendingApprovals = await getPendingHangApprovals();
  const hangHistory = await getHangHistory();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Parent Dashboard
            </h1>
            <p className="text-[var(--muted)] mt-2">
              Welcome back, {session.name || "Parent"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <form action={logout}>
              <button className="bg-[var(--card-bg)] hover:opacity-80 border border-[var(--card-border)] px-6 py-2 rounded-xl transition-all">
                Log Out
              </button>
            </form>
          </div>
        </header>

        {!session.emailVerified && (
          <div className="mb-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center text-2xl">
                ✉
              </div>
              <div>
                <h3 className="font-bold text-lg">Verify your email address</h3>
                <p className="text-gray-400">
                  Please check your inbox for a verification link to unlock all
                  parent features.
                </p>
              </div>
            </div>
            <button className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Resend Link
            </button>
          </div>
        )}

        <PendingApprovals approvals={pendingApprovals} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Crew & Add Child */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Crew</h2>

            <div
              className={
                session.emailVerified ? "" : "opacity-50 pointer-events-none"
              }
            >
              <AddChildForm />
              {!session.emailVerified && (
                <p className="text-xs text-center mt-2 text-blue-400 font-medium">
                  Verify email to add children
                </p>
              )}
            </div>

            {children.length === 0 ? (
              <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-dashed border-[var(--card-border)] text-center text-[var(--muted)] text-sm">
                No children yet
              </div>
            ) : (
              <div className="space-y-2">
                {children.map((child: any) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Hang History */}
          <div className="lg:col-span-3">
            <HangHistory history={hangHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
