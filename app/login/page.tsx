'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()

	const message = searchParams.get('message')

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function handleLogin(
		event: React.FormEvent<HTMLFormElement>
	) {
		event.preventDefault()

		setLoading(true)
		setError('')

		const supabase = createClient()

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			setError(error.message)
			setLoading(false)
			return
		}

		if (!data.session) {
			setError('Login succeeded, but no session was created.')
			setLoading(false)
			return
		}

		router.replace('/dashboard')
		router.refresh()
	}

	return (
		<main className="min-h-screen flex items-center justify-center bg-offwhite px-4">
			<div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
				<h1 className="text-3xl font-bold text-center text-periwinkle">
					Welcome back
				</h1>

				<p className="mt-2 text-center text-gray-500">
					Log in to your Moodify journal
				</p>

				{message && (
					<div className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
						{message}
					</div>
				)}

				{error && (
					<div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				)}

				<form
					onSubmit={handleLogin}
					className="mt-6 space-y-4"
				>
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
							value={email}
							onChange={(event) =>
								setEmail(event.target.value)
							}
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
							value={password}
							onChange={(event) =>
								setPassword(event.target.value)
							}
							required
							className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-periwinkle"
							placeholder="Your password"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-periwinkle px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? 'Logging in...' : 'Log In'}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-gray-600">
					Don&apos;t have an account?{' '}
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