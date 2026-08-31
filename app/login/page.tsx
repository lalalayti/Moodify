'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
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
				<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

				<div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4">
					<div className="flex justify-start">
						<div className="moodify-striped-label px-4 py-1">
							<p className="moodify-hand bg-[#c7253b] px-2 text-xl font-bold italic text-white sm:text-2xl">
								welcome to
							</p>
						</div>
					</div>

					<div className="flex justify-center">
						<Image
							src="/moodifyLOGO.svg"
							alt="Moodify"
							width={160}
							height={70}
							priority
							className="h-auto w-[145px] sm:w-[165px]"
						/>
					</div>

					<div className="flex justify-end">
						<div className="moodify-stamp h-20 w-20 text-sm font-bold">
							Member
						</div>
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
							placeholder="you@example.com"
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

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<main className="moodify-kraft min-h-screen" />
			}
		>
			<LoginContent />
		</Suspense>
	)
}