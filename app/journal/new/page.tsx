'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Playlist = {
	id: string
	name: string
	url: string
	image: string | null
}

type Analysis = {
	emotional_summary: string
	music_recommendation: string
	search_terms: string[]
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

export default function NewJournalPage() {
	const router = useRouter()

	const [mood, setMood] = useState('')
	const [content, setContent] = useState('')
	const [playlistStrategy, setPlaylistStrategy] =
		useState('')

	const [entryId, setEntryId] =
		useState<string | null>(null)

	const [analysis, setAnalysis] =
		useState<Analysis | null>(null)

	const [playlists, setPlaylists] =
		useState<Playlist[]>([])

	const [seenPlaylistIds, setSeenPlaylistIds] =
		useState<string[]>([])

	const [selectedPlaylist, setSelectedPlaylist] =
		useState<Playlist | null>(null)

	const [loading, setLoading] =
		useState(false)

	const [saving, setSaving] =
		useState(false)

	const [error, setError] =
		useState('')

	const [completed, setCompleted] =
		useState(false)

	async function handleGenerate() {
		if (!mood || !content.trim() || !playlistStrategy) {
			setError(
				'Please complete the mood, journal entry, and music preference.'
			)
			return
		}

		setLoading(true)
		setError('')
		setAnalysis(null)
		setSelectedPlaylist(null)

		try {
			const supabase = createClient()

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				router.replace('/login')
				return
			}

			let currentEntryId = entryId

			if (!currentEntryId) {
				const { data: entry, error: createError } =
					await supabase
						.from('journal_entries')
						.insert({
							user_id: user.id,
							mood,
							content,
							playlist_strategy:
								playlistStrategy,
						})
						.select('id')
						.single()

				if (createError || !entry) {
					throw new Error(
						createError?.message ||
							'Failed to create journal entry.'
					)
				}

				currentEntryId = entry.id
				setEntryId(entry.id)
			}

			const analyzeResponse =
				await fetch('/api/analyze-entry', {
					method: 'POST',
					headers: {
						'Content-Type':
							'application/json',
					},
					body: JSON.stringify({
						mood,
						content,
						playlistStrategy,
						excludePlaylistIds:
							seenPlaylistIds,
					}),
				})

			const analyzeData =
				await analyzeResponse.json()

			if (!analyzeResponse.ok) {
				throw new Error(
					analyzeData.error ||
						'Failed to generate playlists.'
				)
			}

			const newAnalysis =
				analyzeData.analysis as Analysis

			const newPlaylists =
				(analyzeData.playlists ??
					[]) as Playlist[]

			const reasoning = [
				newAnalysis.emotional_summary,
				newAnalysis.music_recommendation,
				`Search Terms: ${newAnalysis.search_terms.join(', ')}`,
			].join('\n\n')

			const { error: analysisSaveError } =
				await supabase
					.from('journal_entries')
					.update({
						ai_reasoning: reasoning,
						ai_emotional_summary:
							newAnalysis.emotional_summary,
						ai_music_direction:
							newAnalysis.music_recommendation,
						ai_search_terms:
							newAnalysis.search_terms,
					})
					.eq('id', currentEntryId)
					.eq('user_id', user.id)

			if (analysisSaveError) {
				throw new Error(
					analysisSaveError.message
				)
			}

			setAnalysis(newAnalysis)
			setPlaylists(newPlaylists)

			setSeenPlaylistIds((previous) => [
				...new Set([
					...previous,
					...newPlaylists.map(
						(playlist) => playlist.id
					),
				]),
			])
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('Something went wrong.')
			}
		} finally {
			setLoading(false)
		}
	}

	async function handleSavePlaylist() {
		if (!entryId || !selectedPlaylist) {
			setError(
				'Please choose a playlist first.'
			)
			return
		}

		setSaving(true)
		setError('')

		try {
			const supabase = createClient()

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				router.replace('/login')
				return
			}

			const { error: saveError } =
				await supabase
					.from('journal_entries')
					.update({
						spotify_playlist_id:
							selectedPlaylist.id,
						spotify_playlist_name:
							selectedPlaylist.name,
						spotify_playlist_url:
							selectedPlaylist.url,
						spotify_playlist_image:
							selectedPlaylist.image,
					})
					.eq('id', entryId)
					.eq('user_id', user.id)

			if (saveError) {
				throw new Error(saveError.message)
			}

			setCompleted(true)
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('Something went wrong.')
			}
		} finally {
			setSaving(false)
		}
	}

	return (
		<main className="min-h-screen bg-offwhite px-6 py-10">
			<div className="mx-auto max-w-3xl">
				<Link
					href="/dashboard"
					className="text-sm font-medium text-[#818bbe]"
				>
					← Back to dashboard
				</Link>

				<div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
					<h1 className="text-3xl font-bold text-[#818bbe]">
						New Journal Entry
					</h1>

					<p className="mt-2 text-gray-500">
						Write about your day and find music
						that fits what you need.
					</p>

					{error && (
						<div className="mt-5 rounded-xl bg-red-100 p-3 text-sm text-red-700">
							{error}
						</div>
					)}

					<section className="mt-8">
						<h2 className="font-semibold text-gray-800">
							How are you feeling?
						</h2>

						<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
							{moods.map((item) => (
								<button
									key={item.value}
									type="button"
									onClick={() =>
										setMood(item.value)
									}
									disabled={Boolean(entryId)}
									className={`rounded-2xl border p-4 text-center transition ${
										mood === item.value
											? 'border-[#818bbe] bg-[#f7fbfe]'
											: 'border-gray-200'
									}`}
								>
									<div className="text-2xl">
										{item.emoji}
									</div>

									<p className="mt-1 text-sm font-medium text-gray-700">
										{item.label}
									</p>
								</button>
							))}
						</div>
					</section>

					<section className="mt-8">
						<label
							htmlFor="content"
							className="font-semibold text-gray-800"
						>
							What&apos;s on your mind?
						</label>

						<textarea
							id="content"
							rows={8}
							value={content}
							onChange={(event) =>
								setContent(event.target.value)
							}
							disabled={Boolean(entryId)}
							placeholder="Write about your day..."
							className="mt-3 w-full resize-none rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#818bbe] disabled:bg-gray-50"
						/>
					</section>

					<section className="mt-8">
						<h2 className="font-semibold text-gray-800">
							What kind of music do you want?
						</h2>

						<div className="mt-3 space-y-3">
							<button
								type="button"
								onClick={() =>
									setPlaylistStrategy('match')
								}
								disabled={Boolean(entryId)}
								className={`w-full rounded-2xl border p-4 text-left transition ${
									playlistStrategy === 'match'
										? 'border-[#818bbe] bg-[#f7fbfe]'
										: 'border-gray-200'
								}`}
							>
								<p className="font-medium text-gray-800">
									Match my mood
								</p>

								<p className="text-sm text-gray-500">
									Recommend music that fits how
									I feel.
								</p>
							</button>

							<button
								type="button"
								onClick={() =>
									setPlaylistStrategy(
										'cheer_up'
									)
								}
								disabled={Boolean(entryId)}
								className={`w-full rounded-2xl border p-4 text-left transition ${
									playlistStrategy ===
									'cheer_up'
										? 'border-[#818bbe] bg-[#f7fbfe]'
										: 'border-gray-200'
								}`}
							>
								<p className="font-medium text-gray-800">
									Cheer me up
								</p>

								<p className="text-sm text-gray-500">
									Recommend music that may help
									lift the mood.
								</p>
							</button>
						</div>
					</section>

					<div className="mt-8">
						<button
							type="button"
							onClick={handleGenerate}
							disabled={loading || completed}
							className="rounded-xl bg-[#fbbd53] px-5 py-3 font-semibold text-gray-800 transition hover:opacity-90 disabled:opacity-50"
						>
							{loading
								? 'Finding Playlists...'
								: entryId
									? 'Generate Again'
									: 'Generate Playlists'}
						</button>
					</div>

					{analysis && (
						<section className="mt-8 border-t border-gray-100 pt-6">
							<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
								AI Music Analysis
							</h2>

							<div className="mt-4 rounded-2xl bg-[#f7fbfe] p-5">
								<p className="font-semibold text-gray-800">
									Emotional Summary
								</p>

								<p className="mt-1 text-gray-700">
									{analysis.emotional_summary}
								</p>

								<p className="mt-5 font-semibold text-gray-800">
									Music Direction
								</p>

								<p className="mt-1 text-gray-700">
									{analysis.music_recommendation}
								</p>
							</div>
						</section>
					)}

					{playlists.length > 0 && (
						<section className="mt-8 border-t border-gray-100 pt-6">
							<div className="flex items-center justify-between gap-4">
								<div>
									<h2 className="text-xl font-semibold text-gray-800">
										Choose a Playlist
									</h2>

									<p className="mt-1 text-sm text-gray-500">
										Select the playlist you want to save with this journal entry.
									</p>
								</div>

								<button
									type="button"
									onClick={handleGenerate}
									disabled={loading || completed}
									className="rounded-xl border border-[#818bbe] px-4 py-2 text-sm font-semibold text-[#818bbe] transition hover:bg-[#f7fbfe] disabled:cursor-not-allowed disabled:opacity-50"
								>
									{loading
										? 'Refreshing...'
										: 'Refresh Suggestions'}
								</button>
							</div>

							<div className="mt-5 space-y-4">
								{playlists.map((playlist) => {
									const selected =
										selectedPlaylist?.id ===
										playlist.id

									return (
										<button
											key={playlist.id}
											type="button"
											onClick={() =>
												setSelectedPlaylist(
													playlist
												)
											}
											disabled={completed}
											className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
												selected
													? 'border-[#818bbe] bg-[#f7fbfe]'
													: 'border-gray-200'
											}`}
										>
											{playlist.image && (
												<img
													src={playlist.image}
													alt={playlist.name}
													className="h-20 w-20 rounded-xl object-cover"
												/>
											)}

											<div className="min-w-0 flex-1">
												<p className="truncate font-semibold text-gray-800">
													{playlist.name}
												</p>

												<a
													href={playlist.url}
													target="_blank"
													rel="noopener noreferrer"
													onClick={(event) =>
														event.stopPropagation()
													}
													className="mt-1 inline-block text-sm text-[#818bbe] hover:underline"
												>
													Preview on Spotify
												</a>
											</div>

											<div
												className={`h-5 w-5 rounded-full border-2 ${
													selected
														? 'border-[#818bbe] bg-[#818bbe]'
														: 'border-gray-300'
												}`}
											/>
										</button>
									)
								})}
							</div>

							<button
								type="button"
								onClick={handleSavePlaylist}
								disabled={
									!selectedPlaylist ||
									saving ||
									completed
								}
								className="mt-6 rounded-xl bg-[#818bbe] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving
									? 'Saving...'
									: completed
										? 'Playlist Saved'
										: 'Save Selected Playlist'}
							</button>
						</section>
					)}

					{completed && entryId && (
						<section className="mt-8 rounded-2xl bg-green-50 p-5">
							<p className="font-semibold text-green-700">
								Journal and playlist saved!
							</p>

							<div className="mt-4 flex flex-wrap gap-3">
								<Link
									href={`/journal/${entryId}`}
									className="rounded-xl bg-[#818bbe] px-4 py-2 text-sm font-semibold text-white"
								>
									View Journal
								</Link>

								<Link
									href="/dashboard"
									className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
								>
									Back to Dashboard
								</Link>
							</div>
						</section>
					)}
				</div>
			</div>
		</main>
	)
}