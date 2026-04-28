import { createResource, createSignal, Show, Suspense } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { AppLayout } from '~/components/layout';
import { AuthGuard } from '~/components/auth-guard';
import { SecretModal } from '~/components/secret-modal';
import {
  getClient,
  regenerateSecret,
  restoreClient,
  softDeleteClient,
  updateClient,
  type ClientDetail,
  type ClientWithSecret,
} from '~/lib/clients';

export default function ClientDetailPage() {
  return (
    <AppLayout>
      <AuthGuard>
        <ClientDetail />
      </AuthGuard>
    </AppLayout>
  );
}

function ClientDetail() {
  const params = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [reloadTick, setReloadTick] = createSignal(0);
  const [data, { mutate }] = createResource(
    () => ({ id: params.clientId, t: reloadTick() }),
    async (k) => getClient(k.id),
  );

  const [secretModal, setSecretModal] = createSignal<ClientWithSecret | null>(null);
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const reload = () => setReloadTick((t) => t + 1);

  const handleRegenerate = async () => {
    if (!confirm('Regenerate client secret? secret เดิมจะใช้ไม่ได้ทันที')) return;
    setBusy(true);
    setError(null);
    try {
      const c = await regenerateSecret(params.clientId);
      setSecretModal(c);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Soft-delete client นี้?')) return;
    setBusy(true);
    setError(null);
    try {
      await softDeleteClient(params.clientId);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    setError(null);
    try {
      await restoreClient(params.clientId);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div class="max-w-3xl">
      <button
        onClick={() => navigate('/clients')}
        class="mb-4 text-sm text-neutral-500 hover:text-neutral-900"
      >
        ← Back to list
      </button>

      <Suspense fallback={<div class="text-sm text-neutral-500">Loading…</div>}>
        <Show when={data()}>
          {(c) => (
            <>
              <Header client={c()} />
              <Show when={error()}>
                {(msg) => (
                  <div class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {msg()}
                  </div>
                )}
              </Show>
              <EditForm
                client={c()}
                disabled={busy() || !!c().deletedAt}
                onSaved={(updated) => mutate(updated)}
                onError={setError}
              />
              <Actions
                deleted={!!c().deletedAt}
                busy={busy()}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            </>
          )}
        </Show>
      </Suspense>

      <Show when={secretModal()}>
        {(c) => (
          <SecretModal
            clientId={c().clientId}
            clientSecret={c().clientSecret}
            onClose={() => setSecretModal(null)}
          />
        )}
      </Show>
    </div>
  );
}

function Header(props: { client: ClientDetail }) {
  return (
    <div class="border-b border-neutral-200 pb-4">
      <div class="flex items-center gap-3">
        <h1 class="text-xl font-semibold text-neutral-900">
          {props.client.clientName ?? '(no name)'}
        </h1>
        <Show when={props.client.deletedAt}>
          <span class="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
            deleted
          </span>
        </Show>
      </div>
      <div class="mt-2 grid grid-cols-2 gap-3 text-sm text-neutral-600">
        <div>
          <span class="text-xs text-neutral-500">Client ID</span>
          <div class="font-mono text-xs">{props.client.clientId}</div>
        </div>
        <div>
          <span class="text-xs text-neutral-500">Active tokens</span>
          <div>{props.client.activeTokenCount}</div>
        </div>
        <div>
          <span class="text-xs text-neutral-500">Created</span>
          <div>{props.client.createdAt ?? '—'}</div>
        </div>
        <div>
          <span class="text-xs text-neutral-500">Updated</span>
          <div>{props.client.updatedAt ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}

function EditForm(props: {
  client: ClientDetail;
  disabled: boolean;
  onSaved: (c: ClientDetail) => void;
  onError: (m: string) => void;
}) {
  const [clientName, setClientName] = createSignal(props.client.clientName ?? '');
  const [redirectUri, setRedirectUri] = createSignal(props.client.redirectUri);
  const [scope, setScope] = createSignal(props.client.scope ?? '');
  const [grantTypes, setGrantTypes] = createSignal(props.client.grantTypes ?? '');
  const [saving, setSaving] = createSignal(false);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateClient(props.client.clientId, {
        clientName: clientName(),
        redirectUri: redirectUri(),
        scope: scope() || null,
        grantTypes: grantTypes() || null,
      });
      props.onSaved({ ...updated, activeTokenCount: props.client.activeTokenCount });
    } catch (err) {
      props.onError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} class="mt-6 space-y-4">
      <FieldRow label="Client name">
        <input
          type="text"
          value={clientName()}
          onInput={(e) => setClientName(e.currentTarget.value)}
          disabled={props.disabled}
          class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100"
        />
      </FieldRow>
      <FieldRow label="Redirect URI">
        <input
          type="url"
          value={redirectUri()}
          onInput={(e) => setRedirectUri(e.currentTarget.value)}
          disabled={props.disabled}
          class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100"
        />
      </FieldRow>
      <FieldRow label="Scope">
        <input
          type="text"
          value={scope()}
          onInput={(e) => setScope(e.currentTarget.value)}
          disabled={props.disabled}
          class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100"
        />
      </FieldRow>
      <FieldRow label="Grant types">
        <input
          type="text"
          value={grantTypes()}
          onInput={(e) => setGrantTypes(e.currentTarget.value)}
          disabled={props.disabled}
          class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none disabled:bg-neutral-100"
        />
      </FieldRow>

      <Show when={!props.disabled}>
        <button
          type="submit"
          disabled={saving()}
          class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving() ? 'Saving…' : 'Save changes'}
        </button>
      </Show>
    </form>
  );
}

function FieldRow(props: { label: string; children: any }) {
  return (
    <div>
      <label class="text-sm font-medium text-neutral-700">{props.label}</label>
      <div class="mt-1">{props.children}</div>
    </div>
  );
}

function Actions(props: {
  deleted: boolean;
  busy: boolean;
  onRegenerate: () => void;
  onDelete: () => void;
  onRestore: () => void;
}) {
  return (
    <div class="mt-8 border-t border-neutral-200 pt-6">
      <h2 class="text-sm font-semibold text-neutral-900">Actions</h2>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <Show
          when={!props.deleted}
          fallback={
            <button
              onClick={props.onRestore}
              disabled={props.busy}
              class="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              Restore client
            </button>
          }
        >
          <button
            onClick={props.onRegenerate}
            disabled={props.busy}
            class="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            Regenerate secret
          </button>
          <button
            onClick={props.onDelete}
            disabled={props.busy}
            class="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Soft delete
          </button>
        </Show>
      </div>
    </div>
  );
}
