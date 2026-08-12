import Link from 'next/link'
import { signup } from '@/app/auth/actions'

type SignupPageProps = {
    searchParams: Promise<{
    error?: string
    }>
}

export default async function SignupPage({
    searchParams,
}: SignupPageProps) {
    const params = await searchParams

return (
    <main className="min-h-screen flex items-center justify-center bg-offwhite px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-periwinkle">
            Create an account
        </h1>

        <p className="mt-2 text-center text-gray-500">
            Start your Moodify journal
        </p>

        {params.error && (
        <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
            {params.error}
        </div>
        )}

        <form action={signup} className="mt-6 space-y-4">
        <div>
            <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
            >
            Name
            </label>

            <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-periwinkle"
                placeholder="Your name"
            />
        </div>

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
                minLength={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-periwinkle"
                placeholder="At least 6 characters"
            />
        </div>

        <button
            type="submit"
            className="w-full rounded-xl bg-periwinkle px-4 py-3 font-semibold text-white transition hover:opacity-90"
        >
            Sign Up
        </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
            href="/login"
            className="font-semibold text-periwinkle hover:underline"
        >
            Log in
        </Link>
        </p>
    </div>
    </main>
)
}