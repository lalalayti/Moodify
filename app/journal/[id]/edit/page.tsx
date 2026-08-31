'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type JournalEntry = {
	id: string
	mood: string
	content: string
	playlist_strategy: string | null
}

const moods = [
	{
		value: 'happy',
		emoji: '😊',
		label: 'Happy',
	},
	{
		value: 'content',
		emoji: '🙂',
		label: 'Content',
	},
	{
		value: 'neutral',
		emoji: '😐',
		label: 'Neutral',
	},
	{
		value: 'sad',
		emoji: '😔',
		label: 'Sad',
	},
	{
		value: 'depressed',
		emoji: '🌧️',
		label: 'Depressed',
	},
]

export default function EditJournalPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()

	const [entry, setEntry] = useState<JournalEntry | null>(null)
	const [mood, setMood] = useState('')
	const [content, setContent] = useState('')
	const [playlistStrategy, setPlaylistStrategy] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		async function loadEntry() {
			const supabase = createClient()

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				router.replace('/login')
				return
			}

			const { data, error } = await supabase
				.from('journal_entries')
				.select('id, mood, content, playlist_strategy')
				.eq('id', params.id)
				.eq('user_id', user.id)
				.single()

			if (error || !data) {
				setError('Journal entry not found.')
				setLoading(false)
				return
			}

			setEntry(data)
			setMood(data.mood)
			setContent(data.content)
			setPlaylistStrategy(data.playlist_strategy ?? '')
			setLoading(false)
		}

		loadEntry()
	}, [params.id, router])

	async function handleSubmit(
		event: React.FormEvent<HTMLFormElement>
	) {
		event.preventDefault()

		setSaving(true)
		setError('')

		const supabase = createClient()

		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			router.replace('/login')
			return
		}

		const { error } = await supabase
			.from('journal_entries')
			.update({
				mood,
				content,
				playlist_strategy: playlistStrategy,
			})
			.eq('id', params.id)
			.eq('user_id', user.id)

		if (error) {
			setError(error.message)
			setSaving(false)
			return
		}

		router.replace(`/journal/${params.id}`)
		router.refresh()
	}

	if (loading) {
		return (
			<main className="min-h-screen bg-offwhite px-6 py-10">
				<div className="mx-auto max-w-2xl">
					<p className="text-gray-500">
						Loading journal entry...
					</p>
				</div>
			</main>
		)
	}

	if (!entry) {
		return (
			<main className="min-h-screen bg-offwhite px-6 py-10">
				<div className="mx-auto max-w-2xl">
					<Link
						href="/dashboard"
						className="text-sm font-medium text-periwinkle"
					>
						← Back to dashboard
					</Link>

					<div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
						<p className="text-red-600">
							{error || 'Journal entry not found.'}
						</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className="min-h-screen bg-offwhite px-6 py-10">
			<div className="mx-auto max-w-2xl">
				<Link
					href={`/journal/${entry.id}`}
					className="text-sm font-medium text-periwinkle"
				>
					← Back to entry
				</Link>

				<div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
					<h1 className="text-3xl font-bold text-periwinkle">
						Edit Journal Entry
					</h1>

					<p className="mt-2 text-gray-500">
						Update how you felt or what you wrote.
					</p>

					{error && (
						<div className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="mt-8 space-y-8"
					>
						<section>
							<h2 className="font-semibold text-gray-800">
								Choose your mood
							</h2>

							<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
								{moods.map((moodOption) => (
									<label
										key={moodOption.value}
										className="cursor-pointer rounded-2xl border border-gray-200 p-4 text-center"
									>
										<input
											type="radio"
											name="mood"
											value={moodOption.value}
											checked={mood === moodOption.value}
											onChange={(event) =>
												setMood(event.target.value)
											}
											required
											className="mb-2"
										/>

										<div className="text-2xl">
											{moodOption.emoji}
										</div>

										<div className="mt-1 text-sm font-medium text-gray-700">
											{moodOption.label}
										</div>
									</label>
								))}
							</div>
						</section>

						<section>
							<label
								htmlFor="content"
								className="font-semibold text-gray-800"
							>
								What&apos;s on your mind?
							</label>

							<textarea
								id="content"
								name="content"
								required
								rows={8}
								value={content}
								onChange={(event) =>
									setContent(event.target.value)
								}
								className="mt-3 w-full resize-none rounded-2xl border border-gray-300 p-4 outline-none focus:border-periwinkle"
							/>
						</section>

						<section>
							<h2 className="font-semibold text-gray-800">
								What kind of music do you want?
							</h2>

							<div className="mt-3 space-y-3">
								<label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4">
									<input
										type="radio"
										name="playlist_strategy"
										value="match"
										checked={playlistStrategy === 'match'}
										onChange={(event) =>
											setPlaylistStrategy(
												event.target.value
											)
										}
										required
									/>

									<div>
										<p className="font-medium text-gray-800">
											Match my mood
										</p>

										<p className="text-sm text-gray-500">
											Recommend music that fits how I feel.
										</p>
									</div>
								</label>

								<label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4">
									<input
										type="radio"
										name="playlist_strategy"
										value="cheer_up"
										checked={
											playlistStrategy === 'cheer_up'
										}
										onChange={(event) =>
											setPlaylistStrategy(
												event.target.value
											)
										}
										required
									/>

									<div>
										<p className="font-medium text-gray-800">
											Cheer me up
										</p>

										<p className="text-sm text-gray-500">
											Recommend music that may help lift my mood.
										</p>
									</div>
								</label>
							</div>
						</section>

						<div className="flex gap-3">
							<button
								type="submit"
								disabled={saving}
								className="rounded-xl bg-marigold px-5 py-3 font-semibold text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving
									? 'Saving...'
									: 'Save Changes'}
							</button>

							<Link
								href={`/journal/${entry.id}`}
								className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-600"
							>
								Cancel
							</Link>
						</div>
					</form>
				</div>
			</div>
		</main>
	)
}