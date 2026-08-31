'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

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
		<main className="moodify-kraft flex min-h-screen items-center justify-center px-5 py-12">
			<div className="moodify-paper moodify-paper-edge relative w-full max-w-xl px-8 pb-8 pt-10 sm:px-12">
				{/* Tape */}
				<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

				<div className="relative flex items-start justify-between gap-4">
					<div className="moodify-striped-label px-4 py-1">
						<p className="moodify-hand bg-[#c7253b] px-2 text-xl font-bold italic text-white sm:text-2xl">
							join moodify
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
						New
					</div>
				</div>

				<p className="moodify-hand mt-5 text-center text-sm text-[#75685c]">
					start your private little journal
				</p>

				{error && (
					<div className="mt-5 border border-dashed border-[#c7253b] bg-red-50 px-4 py-3 text-sm text-[#a91f32]">
						{error}
					</div>
				)}

				<form
					onSubmit={handleSignup}
					className="mt-8 space-y-5"
				>
					<div className="grid items-center gap-2 sm:grid-cols-[110px_1fr]">
						<label
							htmlFor="name"
							className="moodify-hand text-xl font-bold italic text-[#c7253b]"
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
							className="moodify-input"
							placeholder="Your name"
						/>
					</div>

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
							minLength={6}
							className="moodify-input"
							placeholder="At least 6 characters"
						/>
					</div>

					<div className="pt-4">
						<button
							type="submit"
							disabled={loading}
							className="moodify-button moodify-hand mx-auto block w-full max-w-[250px] px-6 py-3 text-xl font-bold italic disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading
								? 'Creating account...'
								: 'Sign Up'}
						</button>
					</div>
				</form>

				<p className="mt-6 text-center text-sm text-[#342b24]">
					Already a member?{' '}
					<Link
						href="/login"
						className="moodify-hand font-bold text-[#c7253b] hover:underline"
					>
						Log in
					</Link>
				</p>
			</div>
		</main>
	)
}