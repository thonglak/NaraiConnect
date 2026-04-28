import { createResource, For, Show, Suspense } from 'solid-js';
import { A } from '@solidjs/router';
import { AppLayout } from '~/components/layout';
import { AuthGuard } from '~/components/auth-guard';
import { fetchDashboardStats, type DashboardStats } from '~/lib/dashboard';

export default function DashboardPage() {
  return (
    <AppLayout>
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    </AppLayout>
  );
}

function Dashboard() {
  const [stats] = createResource(fetchDashboardStats);

  return (
    <div>
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <A
          href="/clients/new"
          class="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + New client
        </A>
      </div>

      <Suspense fallback={<div class="mt-8 text-sm text-neutral-500">Loading…</div>}>
        <Show when={stats()} fallback={<ErrorBox message={stats.error?.message} />}>
          {(s) => (
            <>
              <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Clients (active)" value={s().clients.active} accent="emerald" />
                <StatCard label="Clients (deleted)" value={s().clients.deleted} accent="neutral" />
                <StatCard label="Active access tokens" value={s().tokens.activeAccess} accent="blue" />
                <StatCard label="Active refresh tokens" value={s().tokens.activeRefresh} accent="violet" />
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Total clients" value={s().clients.total} accent="neutral" />
                <StatCard label="Auth codes (active)" value={s().authCodes.active} accent="amber" />
                <StatCard label="Scopes" value={s().scopes.total} accent="neutral" />
              </div>

              <section class="mt-10">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-semibold text-neutral-900">Recent clients</h2>
                  <A href="/clients" class="text-xs text-neutral-600 hover:text-neutral-900">
                    View all →
                  </A>
                </div>
                <RecentClients items={s().recentClients} />
              </section>
            </>
          )}
        </Show>
      </Suspense>
    </div>
  );
}

const accentClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  neutral: 'bg-neutral-50 text-neutral-700 ring-neutral-200',
};

function StatCard(props: { label: string; value: number; accent: keyof typeof accentClasses }) {
  return (
    <div
      class={`rounded-lg p-4 ring-1 ${accentClasses[props.accent] ?? accentClasses.neutral}`}
    >
      <div class="text-xs font-medium uppercase tracking-wide opacity-70">{props.label}</div>
      <div class="mt-1 text-2xl font-semibold tabular-nums">{props.value.toLocaleString()}</div>
    </div>
  );
}

function RecentClients(props: { items: DashboardStats['recentClients'] }) {
  return (
    <div class="mt-3 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <table class="w-full text-sm">
        <thead class="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
          <tr>
            <th class="px-4 py-2">Name</th>
            <th class="px-4 py-2">Client ID</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          <For
            each={props.items}
            fallback={
              <tr>
                <td colspan="4" class="px-4 py-6 text-center text-neutral-500">
                  ยังไม่มี client
                </td>
              </tr>
            }
          >
            {(c) => (
              <tr class="border-t border-neutral-100">
                <td class="px-4 py-2">
                  <A
                    href={`/clients/${c.clientId}`}
                    class="font-medium text-neutral-900 hover:underline"
                  >
                    {c.clientName ?? '(no name)'}
                  </A>
                </td>
                <td class="px-4 py-2 font-mono text-xs text-neutral-600">{c.clientId}</td>
                <td class="px-4 py-2">
                  <Show when={!c.deletedAt} fallback={<DeletedBadge />}>
                    <Show when={c.isActive === 1} fallback={<InactiveBadge />}>
                      <ActiveBadge />
                    </Show>
                  </Show>
                </td>
                <td class="px-4 py-2 text-xs text-neutral-600">{formatDate(c.createdAt)}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

const ActiveBadge = () => (
  <span class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
    active
  </span>
);
const InactiveBadge = () => (
  <span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
    inactive
  </span>
);
const DeletedBadge = () => (
  <span class="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
    deleted
  </span>
);

const formatDate = (s: string | null): string => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

function ErrorBox(props: { message?: string | undefined }) {
  return (
    <div class="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {props.message ?? 'Failed to load dashboard'}
    </div>
  );
}
