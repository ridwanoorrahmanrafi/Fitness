import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase.from("notes").select();

  return (
    <div className="min-h-screen bg-[#03081a] text-zinc-100 p-6 sm:p-10 font-mono system-grid-bg">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border-b-2 border-cyan-400/60 pb-4">
          <div className="text-xs text-cyan-400 font-black tracking-widest uppercase">
            [ SUPABASE SERVER QUERY : ক্লাউড ডাটাবেস ]
          </div>
          <h1 className="text-2xl font-black text-white text-glow-cyan uppercase">
            NOTES · SERVER COMPONENT
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Queried in Next.js Server Component via @supabase/ssr using official Supabase project credentials.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200">
            <strong className="block text-red-400 uppercase font-black mb-1">
              [ QUERY NOTICE / RLS CHECK ]
            </strong>
            <span>{error.message}</span>
            <p className="text-[11px] text-zinc-400 mt-2">
              Note: If table `notes` is newly created with RLS enabled, ensure a SELECT policy is enabled or create policy:
              <br />
              <code className="text-cyan-300">create policy &quot;Allow public read for notes&quot; on public.notes for select using (true);</code>
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-cyan-500/40 bg-black/70 p-4 shadow-lg shadow-cyan-500/10">
            <div className="text-xs text-cyan-300 font-bold mb-2">QUERY RESULT :</div>
            <pre className="text-xs text-emerald-300 overflow-x-auto p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              {JSON.stringify(notes, null, 2)}
            </pre>
          </div>
        )}

        <div className="pt-4 border-t border-cyan-500/30 flex justify-between text-xs text-zinc-500">
          <span>SUPABASE ENDPOINT: https://vdaenqmujfpduvjmuxzm.supabase.co</span>
          <a href="/#app" className="text-cyan-400 hover:underline">
            ← Back to ARISE Coach
          </a>
        </div>
      </div>
    </div>
  );
}
