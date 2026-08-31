'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

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

		const { data, error } =
			await supabase.auth.signInWithPassword({
				email,
				password,
			})

		if (error) {
			setError(error.message)
			setLoading(false)
			return
		}

		if (!data.session) {
			setError(
				'Login succeeded, but no session was created.'
			)
			setLoading(false)
			return
		}

		router.replace('/dashboard')
		router.refresh()
	}

	return (
		<main className="moodify-kraft flex min-h-screen items-center justify-center px-5 py-12">
			<div className="moodify-paper moodify-paper-edge relative w-full max-w-xl px-8 pb-8 pt-10 sm:px-12">
				{/* Tape */}
				<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

				{/* Top area */}
				<div className="relative flex items-start justify-between gap-4">
					<div className="moodify-striped-label px-4 py-1">
						<p className="moodify-hand bg-[#c7253b] px-2 text-2xl font-bold italic text-white">
							welcome to
						</p>
					</div>

					<div className="flex items-center justify-center">
						<Image
							src="/moodifyLOGO.svg"
							alt="Moodify"
							width={150}
							height={70}
							priority
							className="h-auto w-[140px] sm:w-[155px]"
						/>
					</div>

					<div className="moodify-stamp -mt-7 h-20 w-20 text-sm font-bold">
						Member
					</div>
				</div>

				<p className="moodify-hand mt-5 text-center text-sm text-[#75685c]">
					your little corner for thoughts & music
				</p>

				{message && (
					<div className="mt-5 border border-dashed border-green-600 bg-green-50 px-4 py-3 text-sm text-green-700">
						{message}
					</div>
				)}

				{error && (
					<div className="mt-5 border border-dashed border-[#c7253b] bg-red-50 px-4 py-3 text-sm text-[#a91f32]">
						{error}
					</div>
				)}

				<form
					onSubmit={handleLogin}
					className="mt-8 space-y-5"
				>
					<div className="grid items-center gap-2 sm:grid-cols-[110px_1fr]">
						<label
							htmlFor="email"
							className="moodify-hand text-xl font-bold italic text-[#c7253b]"
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
							className="moodify-input"
							placeholder="mymoodify@gmail.com"
						/>
					</div>

					<div className="grid items-center gap-2 sm:grid-cols-[110px_1fr]">
						<label
							htmlFor="password"
							className="moodify-hand text-xl font-bold italic text-[#c7253b]"
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
							className="moodify-input"
							placeholder="Your password"
						/>
					</div>

					<div className="pt-4">
						<button
							type="submit"
							disabled={loading}
							className="moodify-button moodify-hand mx-auto block w-full max-w-[250px] px-6 py-3 text-xl font-bold italic disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading
								? 'Logging in...'
								: 'Log In'}
						</button>
					</div>
				</form>

				<p className="mt-6 text-center text-sm text-[#342b24]">
					New here?{' '}
					<Link
						href="/signup"
						className="moodify-hand font-bold text-[#c7253b] hover:underline"
					>
						Make an account
					</Link>
				</p>
			</div>
		</main>
	)
}