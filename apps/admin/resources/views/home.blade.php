<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>NaraiConnect Admin</title>
    @vite(['resources/css/app.css'])
</head>
<body class="bg-neutral-50 text-neutral-900 antialiased">
    <main class="flex min-h-screen items-center justify-center p-8">
        <div class="w-full max-w-sm text-center">
            <h1 class="text-2xl font-semibold">NaraiConnect Admin</h1>
            <p class="mt-2 text-sm text-neutral-600">จัดการ OAuth2 clients ของระบบ SSO Narai Property</p>

            @if ($errors->any())
                <div class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-left text-sm text-red-700">
                    @foreach ($errors->all() as $msg)
                        <div>{{ $msg }}</div>
                    @endforeach
                </div>
            @endif

            <a href="{{ route('auth.login') }}"
               class="mt-6 inline-block w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
                เข้าสู่ระบบด้วย NaraiConnect
            </a>
        </div>
    </main>
</body>
</html>
