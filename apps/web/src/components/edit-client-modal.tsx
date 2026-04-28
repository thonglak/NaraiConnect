import { createSignal, Show } from 'solid-js';
import { updateClient, type ClientDetail, type ClientListItem } from '~/lib/clients';

export function EditClientModal(props: {
  client: ClientListItem | ClientDetail;
  onSaved: (updated: ClientDetail) => void;
  onClose: () => void;
}) {
  const [clientName, setClientName] = createSignal(props.client.clientName ?? '');
  const [redirectUri, setRedirectUri] = createSignal(props.client.redirectUri);
  const [scope, setScope] = createSignal(props.client.scope ?? '');
  const [grantTypes, setGrantTypes] = createSignal(props.client.grantTypes ?? '');
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await updateClient(props.client.clientId, {
        clientName: clientName(),
        redirectUri: redirectUri(),
        scope: scope() || null,
        grantTypes: grantTypes() || null,
      });
      props.onSaved(updated);
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving()) props.onClose();
      }}
    >
      <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-neutral-900">Edit client</h2>
            <p class="mt-0.5 font-mono text-xs text-neutral-500">{props.client.clientId}</p>
          </div>
          <button
            onClick={props.onClose}
            disabled={saving()}
            aria-label="Close"
            class="text-neutral-400 hover:text-neutral-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} class="mt-4 space-y-4">
          <Field label="Client name" required>
            <input
              type="text"
              value={clientName()}
              onInput={(e) => setClientName(e.currentTarget.value)}
              required
              class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </Field>
          <Field label="Redirect URI" required>
            <input
              type="url"
              value={redirectUri()}
              onInput={(e) => setRedirectUri(e.currentTarget.value)}
              required
              class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </Field>
          <Field label="Scope" hint="คั่นด้วย space ถ้ามีหลาย scope">
            <input
              type="text"
              value={scope()}
              onInput={(e) => setScope(e.currentTarget.value)}
              class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </Field>
          <Field label="Grant types" hint="คั่นด้วย space ถ้ามีหลายแบบ">
            <input
              type="text"
              value={grantTypes()}
              onInput={(e) => setGrantTypes(e.currentTarget.value)}
              class="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </Field>

          <Show when={error()}>
            {(msg) => (
              <div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {msg()}
              </div>
            )}
          </Show>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={props.onClose}
              disabled={saving()}
              class="rounded-md border border-neutral-300 px-4 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving() || !clientName() || !redirectUri()}
              class="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {saving() ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  hint?: string;
  children: any;
}) {
  return (
    <label class="block">
      <span class="text-sm font-medium text-neutral-700">
        {props.label}
        <Show when={props.required}>
          <span class="ml-1 text-red-600">*</span>
        </Show>
      </span>
      <div class="mt-1">{props.children}</div>
      <Show when={props.hint}>
        <span class="mt-1 block text-xs text-neutral-500">{props.hint}</span>
      </Show>
    </label>
  );
}
