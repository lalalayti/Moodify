import Link from 'next/link'
import { login } from '@/app/auth/actions'

type LoginPageProps = {
    searchParams: Promise<{
        error?: string
        message?: string
    }>
}

    export default async function LoginPage({
    searchParams,
    }: LoginPageProps) {
    const params = await searchParams

    return (
        <main className="min-h-screen flex items-center justify-center bg-offwhite px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
            <h1 className="text-3xl font-bold text-center text-periwinkle">
            Welcome back
            </h1>

            <p className="mt-2 text-center text-gray-500">
            Log in to your Moodify journal
            </p>

            {params.message && (
            <div className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
                {params.message}
            </div>
            )}

            {params.error && (
            <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                {params.error}
            </div>
            )}

            <form action={login} className="mt-6 space-y-4">
            <div>
                <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
                >
                Email
                </label>

                <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-periwinkle"
                placeholder="you@example.com"
                />
            </div>

            <div>
                <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
                >
                Password
                </label>

                <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-periwinkle"
                placeholder="Your password"
                />
            </div>

            <button
                type="submit"
                className="w-full rounded-xl bg-periwinkle px-4 py-3 font-semibold text-white transition hover:opacity-90"
            >
                Log In
            </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
                href="/signup"
                className="font-semibold text-periwinkle hover:underline"
            >
                Sign up
            </Link>
            </p>
        </div>
        </main>
    )
}