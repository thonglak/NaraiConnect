import { createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { AppLayout } from '~/components/layout';
import { AuthGuard } from '~/components/auth-guard';
import { SecretModal } from '~/components/secret-modal';
import { createClient, type ClientWithSecret } from '~/lib/clients';

export default function NewClientPage() {
  return (
    <AppLayout>
      <AuthGuard>
        <NewClientForm />
      </AuthGuard>
    </AppLayout>
  );
}

function NewClientForm() {
  const navigate = useNavigate();
  const [clientName, setClientName] = createSignal('');
  const [redirectUri, setRedirectUri] = createSignal('');
  const [scope, setScope] = createSignal('email');
  const [grantTypes, setGrantTypes] = createSignal('authorization_code');
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [created, setCreated] = createSignal<ClientWithSecret | null>(null);

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const c = await createClient({
        clientName: clientName(),
        redirectUri: redirectUri(),
        scope: scope() || null,
        grantTypes: grantTypes() || null,
      });
      setCreated(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const onCloseModal = () => {
    const c = created();
    if (c) navigate(`/clients/${c.clientId}`, { replace: true });
  };

  return (
    <div class="max-w-xl">
      <h1 class="text-xl font-semibold text-neutral-900">Create OAuth Client</h1>
      <p class="mt-1 text-sm text-neutral-600">
        ระบบจะสุ่ม client_id และ client_secret ให้อัตโนมัติ
      </p>

      <form onSubmit={onSubmit} class="mt-6 space-y-4">
        <Field
          label="Client name"
          required
          value={clientName()}
          onInput={setClientName}
          placeholder="เช่น naraiapps-prod"
        />
        <Field
          label="Redirect URI"
          required
          value={redirectUri()}
          onInput={setRedirectUri}
          placeholder="https://example.com/callback"
          type="url"
        />
        <Field
          label="Scope"
          value={scope()}
          onInput={setScope}
          placeholder="email"
          hint="คั่นด้วย space ถ้ามีหลาย scope"
        />
        <Field
          label="Grant types"
          value={grantTypes()}
          onInput={setGrantTypes}
          placeholder="authorization_code"
          hint="คั่นด้วย space ถ้ามีหลายแบบ"
        />

        <Show when={error()}>
          {(msg) => (
            <div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {msg()}
            </div>
          )}
        </Show>

        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting() || !clientName() || !redirectUri()}
            class="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {submitting() ? 'Creating…' : 'Create client'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/clients')}
            class="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>

      <Show when={created()}>
        {(c) => (
          <SecretModal
            clientId={c().clientId}
            clientSecret={c().clientSecret}
            onClose={onCloseModal}
          />
        )}
      </Show>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onInput: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <label class="block">
      <span class="text-sm font-medium text-neutral-700">
        {props.label}
        <Show when={props.required}>
          <span class="ml-1 text-red-600">*</span>
        </Show>
      </span>
      <input
        type={props.type ?? 'text'}
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
        placeholder={props.placeholder}
        required={props.required}
        class="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
      />
      <Show when={props.hint}>
        <span class="mt-1 block text-xs text-neutral-500">{props.hint}</span>
      </Show>
    </label>
  );
}
