'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
	const router = useRouter()

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function handleSignup(
		event: React.FormEvent<HTMLFormElement>
	) {
		event.preventDefault()

		setLoading(true)
		setError('')

		const supabase = createClient()

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
				},
			},
		})

		if (error) {
			setError(error.message)
			setLoading(false)
			return
		}

		router.replace(
			'/login?message=Check your email to confirm your account.'
		)
		router.refresh()
	}

	return (
		<main className="min-h-screen flex items-center justify-center bg-offwhite px-4">
			<div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
				<h1 className="text-3xl font-bold text-center text-periwinkle">
					Create an account
				</h1>

				<p className="mt-2 text-center text-gray-500">
					Start your Moodify journal
				</p>

				{error && (
					<div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				)}

				<form
					onSubmit={handleSignup}
					className="mt-6 space-y-4"
				>
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
							value={name}
							onChange={(event) =>
								setName(event.target.value)
							}
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
							minLength={6}
							className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-periwinkle"
							placeholder="At least 6 characters"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full rounded-xl bg-periwinkle px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading
							? 'Creating account...'
							: 'Sign Up'}
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