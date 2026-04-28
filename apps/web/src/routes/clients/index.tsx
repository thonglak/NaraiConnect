import { createMemo, createResource, createSignal, For, Show, Suspense } from 'solid-js';
import { A } from '@solidjs/router';
import { AppLayout } from '~/components/layout';
import { AuthGuard } from '~/components/auth-guard';
import { EditClientModal } from '~/components/edit-client-modal';
import {
  listClients,
  restoreClient,
  softDeleteClient,
  type ClientListItem,
  type ClientStatus,
} from '~/lib/clients';

export default function ClientsListPage() {
  return (
    <AppLayout>
      <AuthGuard>
        <ClientsList />
      </AuthGuard>
    </AppLayout>
  );
}

function ClientsList() {
  const [q, setQ] = createSignal('');
  const [status, setStatus] = createSignal<ClientStatus>('active');
  const [page, setPage] = createSignal(1);
  const pageSize = 20;
  const [reloadTick, setReloadTick] = createSignal(0);
  const [editing, setEditing] = createSignal<ClientListItem | null>(null);

  const params = createMemo(() => ({ q: q(), status: status(), page: page(), pageSize, _t: reloadTick() }));

  const [data, { refetch }] = createResource(params, async (p) => {
    return listClients({ q: p.q || undefined, status: p.status, page: p.page, pageSize: p.pageSize });
  });

  const totalPages = createMemo(() => {
    const total = data()?.total ?? 0;
    return Math.max(1, Math.ceil(total / pageSize));
  });

  const handleDelete = async (c: ClientListItem) => {
    if (!confirm(`Soft-delete client "${c.clientName ?? c.clientId}"?`)) return;
    await softDeleteClient(c.clientId);
    setReloadTick((t) => t + 1);
  };

  const handleRestore = async (c: ClientListItem) => {
    await restoreClient(c.clientId);
    setReloadTick((t) => t + 1);
  };

  return (
    <div>
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-neutral-900">OAuth Clients</h1>
        <A
          href="/clients/new"
          class="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + New client
        </A>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="ค้นหาตามชื่อหรือ client_id"
          value={q()}
          onInput={(e) => {
            setQ(e.currentTarget.value);
            setPage(1);
          }}
          class="w-72 rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <select
          value={status()}
          onChange={(e) => {
            setStatus(e.currentTarget.value as ClientStatus);
            setPage(1);
          }}
          class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
        >
          <option value="active">Active only</option>
          <option value="deleted">Deleted only</option>
          <option value="all">All</option>
        </select>
        <button
          onClick={() => refetch()}
          class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
        >
          Refresh
        </button>
      </div>

      <Suspense fallback={<div class="mt-6 text-sm text-neutral-500">Loading…</div>}>
        <Show when={data()} fallback={<ErrorBox message={data.error?.message} />}>
          {(d) => (
            <>
              <div class="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                <table class="w-full text-sm">
                  <thead class="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                    <tr>
                      <th class="px-4 py-2">Name</th>
                      <th class="px-4 py-2">Client ID</th>
                      <th class="px-4 py-2">Redirect URI</th>
                      <th class="px-4 py-2">Scope</th>
                      <th class="px-4 py-2">Status</th>
                      <th class="px-4 py-2 text-right">Active tokens</th>
                      <th class="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <For
                      each={d().items}
                      fallback={
                        <tr>
                          <td colspan="7" class="px-4 py-8 text-center text-neutral-500">
                            ไม่พบ client
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
                          <td class="px-4 py-2 font-mono text-xs text-neutral-600">
                            {c.clientId}
                          </td>
                          <td class="px-4 py-2 max-w-xs truncate text-xs text-neutral-600">
                            {c.redirectUri}
                          </td>
                          <td class="px-4 py-2 text-xs text-neutral-600">{c.scope ?? '—'}</td>
                          <td class="px-4 py-2">
                            <StatusBadge active={c.isActive === 1} deleted={!!c.deletedAt} />
                          </td>
                          <td class="px-4 py-2 text-right text-neutral-600">
                            {c.activeTokenCount}
                          </td>
                          <td class="px-4 py-2 text-right">
                            <Show
                              when={!c.deletedAt}
                              fallback={
                                <button
                                  onClick={() => handleRestore(c)}
                                  class="text-xs text-emerald-700 hover:underline"
                                >
                                  Restore
                                </button>
                              }
                            >
                              <div class="flex justify-end gap-3">
                                <button
                                  onClick={() => setEditing(c)}
                                  class="text-xs text-neutral-700 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(c)}
                                  class="text-xs text-red-700 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </Show>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>

              <Pagination page={page()} totalPages={totalPages()} total={d().total} onChange={setPage} />
            </>
          )}
        </Show>
      </Suspense>

      <Show when={editing()}>
        {(c) => (
          <EditClientModal
            client={c()}
            onSaved={() => setReloadTick((t) => t + 1)}
            onClose={() => setEditing(null)}
          />
        )}
      </Show>
    </div>
  );
}

function StatusBadge(props: { active: boolean; deleted: boolean }) {
  if (props.deleted) {
    return (
      <span class="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
        deleted
      </span>
    );
  }
  return props.active ? (
    <span class="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
      active
    </span>
  ) : (
    <span class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      inactive
    </span>
  );
}

function Pagination(props: { page: number; totalPages: number; total: number; onChange: (p: number) => void }) {
  return (
    <div class="mt-4 flex items-center justify-between text-sm text-neutral-600">
      <div>{props.total} clients</div>
      <div class="flex items-center gap-2">
        <button
          disabled={props.page <= 1}
          onClick={() => props.onChange(props.page - 1)}
          class="rounded-md border border-neutral-300 px-3 py-1 text-xs disabled:opacity-50 hover:bg-neutral-100"
        >
          Prev
        </button>
        <span>
          {props.page} / {props.totalPages}
        </span>
        <button
          disabled={props.page >= props.totalPages}
          onClick={() => props.onChange(props.page + 1)}
          class="rounded-md border border-neutral-300 px-3 py-1 text-xs disabled:opacity-50 hover:bg-neutral-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ErrorBox(props: { message?: string | undefined }) {
  return (
    <div class="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {props.message ?? 'Failed to load clients'}
    </div>
  );
}
