import { createSignal, Show } from 'solid-js';

export function SecretModal(props: {
  clientId: string;
  clientSecret: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = createSignal<'id' | 'secret' | null>(null);

  const copy = async (key: 'id' | 'secret', value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 class="text-lg font-semibold text-neutral-900">Client credentials</h2>
        <p class="mt-1 text-sm text-amber-700">
          เก็บ secret ไว้ทันที — ระบบจะไม่แสดงอีกครั้ง
        </p>

        <div class="mt-4 space-y-3">
          <Field label="Client ID" value={props.clientId} onCopy={() => copy('id', props.clientId)} copied={copied() === 'id'} />
          <Field
            label="Client Secret"
            value={props.clientSecret}
            onCopy={() => copy('secret', props.clientSecret)}
            copied={copied() === 'secret'}
          />
        </div>

        <button
          onClick={props.onClose}
          class="mt-6 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          ฉันบันทึกเรียบร้อยแล้ว
        </button>
      </div>
    </div>
  );
}

function Field(props: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div>
      <label class="text-xs font-medium text-neutral-600">{props.label}</label>
      <div class="mt-1 flex items-center gap-2">
        <code class="flex-1 truncate rounded border border-neutral-200 bg-neutral-50 px-2 py-1.5 font-mono text-xs">
          {props.value}
        </code>
        <button
          onClick={props.onCopy}
          class="rounded-md border border-neutral-300 px-2 py-1.5 text-xs hover:bg-neutral-100"
        >
          <Show when={props.copied} fallback="Copy">
            ✓
          </Show>
        </button>
      </div>
    </div>
  );
}
