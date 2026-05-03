<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dashboard — NaraiConnect Admin</title>
    @vite(['resources/css/app.css'])
</head>
<body class="bg-neutral-50 text-neutral-900 antialiased">
    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 class="text-xl font-semibold">Dashboard</h1>
        <p class="mt-2 text-sm text-neutral-600">Phase 1 placeholder — pages will be ported in Phase 2.</p>

        <form method="POST" action="{{ route('auth.logout') }}" class="mt-6">
            @csrf
            <button type="submit"
                    class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">
                Logout
            </button>
        </form>
    </main>
</body>
</html>
