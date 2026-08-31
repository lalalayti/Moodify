'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
			<main className="moodify-kraft min-h-screen px-4 py-10 sm:px-6">
				<div className="mx-auto max-w-4xl">
					<div className="moodify-paper moodify-paper-edge relative p-8">
						<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

						<p className="moodify-hand text-center text-lg text-[#75685c]">
							Opening your journal...
						</p>
					</div>
				</div>
			</main>
		)
	}

	if (!entry) {
		return (
			<main className="moodify-kraft min-h-screen px-4 py-10 sm:px-6">
				<div className="mx-auto max-w-4xl">
					<Link
						href="/dashboard"
						className="moodify-hand font-bold text-[#c7253b]"
					>
						← Back to dashboard
					</Link>

					<div className="moodify-paper moodify-paper-edge relative mt-7 p-8">
						<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

						<p className="text-[#a91f32]">
							{error || 'Journal entry not found.'}
						</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className="moodify-kraft min-h-screen px-4 py-8 sm:px-6 sm:py-10">
			<div className="mx-auto max-w-4xl">

				<div className="mb-7 flex items-center justify-between gap-4">
					<Link
						href={`/journal/${entry.id}`}
						className="moodify-hand font-bold text-[#c7253b] transition hover:-translate-x-1"
					>
						← Back to entry
					</Link>

					<Image
						src="/moodifyLOGO.svg"
						alt="Moodify"
						width={130}
						height={60}
						className="h-auto w-[115px] sm:w-[130px]"
					/>
				</div>

				<div className="moodify-paper moodify-paper-edge relative px-5 py-8 sm:px-10 sm:py-10">
					<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-[2deg]" />

					<div className="border-b-2 border-dashed border-[#d3ae73] pb-6">
						<div className="inline-block bg-[#c7253b] px-4 py-1">
							<p className="moodify-hand text-sm font-bold uppercase tracking-[0.15em] text-white">
								edit mode
							</p>
						</div>

						<h1 className="moodify-hand mt-4 text-4xl font-bold text-[#201914]">
							Edit Journal Entry
						</h1>

						<p className="mt-2 text-sm leading-6 text-[#75685c]">
							Change anything you want, then tuck the updated page back into your journal.
						</p>
					</div>

					{error && (
						<div className="mt-6 border-2 border-dashed border-[#c7253b] bg-[#fff1f1] px-4 py-3 text-sm text-[#a91f32]">
							{error}
						</div>
					)}

					<form
						onSubmit={handleSubmit}
						className="mt-8 space-y-10"
					>
						<section>
							<h2 className="moodify-hand text-2xl font-bold text-[#c7253b]">
								1. Update your mood
							</h2>

							<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
								{moods.map((moodOption, index) => {
									const selected =
										mood === moodOption.value

									return (
										<label
											key={moodOption.value}
											className={`cursor-pointer px-3 py-5 text-center transition ${
												selected
													? 'rotate-[-2deg] bg-[#c7253b] text-white shadow-[4px_4px_0_rgba(120,31,43,0.16)]'
													: 'border-2 border-dashed border-[#d3ae73] bg-[#fffaf0] hover:-translate-y-1'
											} ${
												index % 2 === 0
													? 'sm:rotate-[-1deg]'
													: 'sm:rotate-[1deg]'
											}`}
										>
											<input
												type="radio"
												name="mood"
												value={moodOption.value}
												checked={selected}
												onChange={(event) =>
													setMood(event.target.value)
												}
												required
												className="sr-only"
											/>

											<div className="text-3xl">
												{moodOption.emoji}
											</div>

											<div
												className={`moodify-hand mt-2 font-bold ${
													selected
														? 'text-white'
														: 'text-[#3d332b]'
												}`}
											>
												{moodOption.label}
											</div>
										</label>
									)
								})}
							</div>
						</section>

						<section>
							<label
								htmlFor="content"
								className="moodify-hand text-2xl font-bold text-[#c7253b]"
							>
								2. Rewrite your thoughts
							</label>

							<div className="relative mt-5">
								<div className="moodify-tape left-8 top-0 -translate-y-1/2 rotate-[-5deg]" />

								<textarea
									id="content"
									name="content"
									required
									rows={10}
									value={content}
									onChange={(event) =>
										setContent(event.target.value)
									}
									className="w-full resize-none border-2 border-dashed border-[#d3ae73] bg-[#fffdf5] px-5 py-6 leading-8 text-[#3d332b] outline-none transition focus:border-[#c7253b]"
									style={{
										backgroundImage:
											'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(199,37,59,0.10) 32px)',
									}}
								/>
							</div>
						</section>

						<section>
							<h2 className="moodify-hand text-2xl font-bold text-[#c7253b]">
								3. Update your music preference
							</h2>

							<div className="mt-5 grid gap-4 sm:grid-cols-2">
								<label
									className={`cursor-pointer p-5 text-left transition ${
										playlistStrategy === 'match'
											? 'rotate-[-1deg] border-2 border-[#c7253b] bg-[#fff4f1] shadow-[4px_4px_0_rgba(120,31,43,0.13)]'
											: 'border-2 border-dashed border-[#d3ae73] bg-[#fffaf0] hover:-translate-y-1'
									}`}
								>
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
										className="sr-only"
									/>

									<p className="moodify-hand text-xl font-bold text-[#201914]">
										♪ Match my mood
									</p>

									<p className="mt-2 text-sm leading-6 text-[#75685c]">
										Recommend music that fits how I feel.
									</p>
								</label>

								<label
									className={`cursor-pointer p-5 text-left transition ${
										playlistStrategy === 'cheer_up'
											? 'rotate-[1deg] border-2 border-[#c7253b] bg-[#fff4f1] shadow-[4px_4px_0_rgba(120,31,43,0.13)]'
											: 'border-2 border-dashed border-[#d3ae73] bg-[#fffaf0] hover:-translate-y-1'
									}`}
								>
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
										className="sr-only"
									/>

									<p className="moodify-hand text-xl font-bold text-[#201914]">
										☀ Cheer me up
									</p>

									<p className="mt-2 text-sm leading-6 text-[#75685c]">
										Recommend music that may help lift my mood.
									</p>
								</label>
							</div>
						</section>

						<div className="flex flex-wrap gap-4 border-t-2 border-dashed border-[#d3ae73] pt-7">
							<button
								type="submit"
								disabled={saving}
								className="moodify-button moodify-hand px-6 py-3 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving
									? 'Saving...'
									: '✓ Save Changes'}
							</button>

							<Link
								href={`/journal/${entry.id}`}
								className="moodify-hand border-2 border-dashed border-[#c7253b] bg-[#fff9eb] px-6 py-3 font-bold text-[#c7253b] transition hover:bg-[#c7253b] hover:text-white"
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