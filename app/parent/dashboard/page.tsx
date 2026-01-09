import { getChildrenAction } from "@/lib/actions.parent";
import { logout } from "@/lib/actions.auth";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddChildForm from "./AddChildForm";

export default async function ParentDashboard() {
  const session = await getSession();
  if (!session || session.role !== "parent") {
    redirect("/login");
  }

  const children = await getChildrenAction();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Parent Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome back, {session.name || "Parent"}
            </p>
          </div>
          <form action={logout}>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2 rounded-xl transition-all">
              Log Out
            </button>
          </form>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Child Form - Only visible if verified */}
          <div
            className={
              session.emailVerified ? "" : "opacity-50 pointer-events-none"
            }
          >
            <AddChildForm />
            {!session.emailVerified && (
              <p className="text-xs text-center mt-4 text-blue-400 font-medium">
                Verify your email to add children
              </p>
            )}
          </div>

          {/* Children List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-6">Your Crew</h2>
            {children.length === 0 ? (
              <div className="bg-[#161616] p-12 rounded-2xl border border-dashed border-white/10 text-center text-gray-500">
                No child profiles created yet. Add one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((child: any) => (
                  <div
                    key={child.id}
                    className="bg-[#161616] p-6 rounded-2xl border border-white/10 flex items-center space-x-6 hover:border-blue-500/50 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold overflow-hidden">
                      {child.avatar_url ? (
                        <img
                          src={child.avatar_url}
                          alt={child.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        child.display_name[0]
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">
                        {child.display_name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        @{child.username}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all">
                      <button className="text-gray-400 hover:text-white">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
