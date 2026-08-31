'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
		<main className="moodify-kraft min-h-screen px-4 py-8 sm:px-6 sm:py-10">
			<div className="mx-auto max-w-4xl">

				{/* TOP NAV */}
				<div className="mb-7 flex items-center justify-between gap-4">
					<Link
						href="/dashboard"
						className="moodify-hand font-bold text-[#c7253b] transition hover:-translate-x-1"
					>
						← Back to journal
					</Link>

					<Image
						src="/moodifyLOGO.svg"
						alt="Moodify"
						width={130}
						height={60}
						className="h-auto w-[115px] sm:w-[130px]"
					/>
				</div>

				{/* MAIN JOURNAL PAPER */}
				<div className="moodify-paper moodify-paper-edge relative px-5 py-8 sm:px-10 sm:py-10">
					<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

					{/* TITLE */}
					<div className="border-b-2 border-dashed border-[#d3ae73] pb-6">
						<div className="inline-block bg-[#c7253b] px-4 py-1">
							<p className="moodify-hand text-sm font-bold uppercase tracking-[0.15em] text-white">
								today&apos;s entry
							</p>
						</div>

						<h1 className="moodify-hand mt-4 text-4xl font-bold text-[#201914]">
							How are you feeling?
						</h1>

						<p className="mt-2 max-w-xl text-sm leading-6 text-[#75685c]">
							Leave your thoughts here. Moodify will help you find
							something to listen to afterward.
						</p>
					</div>

					{error && (
						<div className="mt-6 border-2 border-dashed border-[#c7253b] bg-[#fff1f1] px-4 py-3 text-sm text-[#a91f32]">
							{error}
						</div>
					)}

					{/* MOODS */}
					<section className="mt-8">
						<h2 className="moodify-hand text-2xl font-bold text-[#c7253b]">
							1. Pick your mood
						</h2>

						<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
							{moods.map((item, index) => {
								const selected =
									mood === item.value

								return (
									<button
										key={item.value}
										type="button"
										onClick={() =>
											setMood(item.value)
										}
										disabled={Boolean(entryId)}
										className={`relative px-3 py-5 text-center transition ${
											selected
												? 'rotate-[-2deg] bg-[#c7253b] text-white shadow-[4px_4px_0_rgba(120,31,43,0.16)]'
												: 'border-2 border-dashed border-[#d3ae73] bg-[#fffaf0] text-[#3d332b] hover:-translate-y-1'
										} ${
											index % 2 === 0
												? 'sm:rotate-[-1deg]'
												: 'sm:rotate-[1deg]'
										}`}
									>
										<div className="text-3xl">
											{item.emoji}
										</div>

										<p
											className={`moodify-hand mt-2 font-bold ${
												selected
													? 'text-white'
													: 'text-[#3d332b]'
											}`}
										>
											{item.label}
										</p>
									</button>
								)
							})}
						</div>
					</section>

					{/* JOURNAL TEXT */}
					<section className="mt-10">
						<label
							htmlFor="content"
							className="moodify-hand text-2xl font-bold text-[#c7253b]"
						>
							2. What&apos;s on your mind?
						</label>

						<div className="relative mt-5">
							<div className="moodify-tape left-8 top-0 -translate-y-1/2 rotate-[-5deg]" />

							<textarea
								id="content"
								rows={9}
								value={content}
								onChange={(event) =>
									setContent(event.target.value)
								}
								disabled={Boolean(entryId)}
								placeholder="Write about your day..."
								className="w-full resize-none border-2 border-dashed border-[#d3ae73] bg-[#fffdf5] px-5 py-6 leading-8 text-[#3d332b] outline-none transition focus:border-[#c7253b] disabled:bg-[#f5ecdc]"
								style={{
									backgroundImage:
										'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(199,37,59,0.10) 32px)',
								}}
							/>
						</div>
					</section>

					{/* MUSIC STRATEGY */}
					<section className="mt-10">
						<h2 className="moodify-hand text-2xl font-bold text-[#c7253b]">
							3. What kind of music do you need?
						</h2>

						<div className="mt-5 grid gap-4 sm:grid-cols-2">
							<button
								type="button"
								onClick={() =>
									setPlaylistStrategy('match')
								}
								disabled={Boolean(entryId)}
								className={`relative p-5 text-left transition ${
									playlistStrategy === 'match'
										? 'rotate-[-1deg] border-2 border-[#c7253b] bg-[#fff4f1] shadow-[4px_4px_0_rgba(120,31,43,0.13)]'
										: 'border-2 border-dashed border-[#d3ae73] bg-[#fffaf0] hover:-translate-y-1'
								}`}
							>
								<p className="moodify-hand text-xl font-bold text-[#201914]">
									♪ Match my mood
								</p>

								<p className="mt-2 text-sm leading-6 text-[#75685c]">
									Recommend music that fits how I feel right now.
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
								className={`relative p-5 text-left transition ${
									playlistStrategy === 'cheer_up'
										? 'rotate-[1deg] border-2 border-[#c7253b] bg-[#fff4f1] shadow-[4px_4px_0_rgba(120,31,43,0.13)]'
										: 'border-2 border-dashed border-[#d3ae73] bg-[#fffaf0] hover:-translate-y-1'
								}`}
							>
								<p className="moodify-hand text-xl font-bold text-[#201914]">
									☀ Cheer me up
								</p>

								<p className="mt-2 text-sm leading-6 text-[#75685c]">
									Recommend music that may help lift the mood.
								</p>
							</button>
						</div>
					</section>

					{/* GENERATE BUTTON */}
					<div className="mt-10 flex justify-center">
						<button
							type="button"
							onClick={handleGenerate}
							disabled={loading || completed}
							className="moodify-button moodify-hand min-w-[230px] px-7 py-3 text-xl font-bold italic disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading
								? 'Finding Playlists...'
								: entryId
									? 'Generate Again'
									: 'Generate Playlists'}
						</button>
					</div>

					{/* AI ANALYSIS */}
					{analysis && (
						<section className="mt-12 border-t-2 border-dashed border-[#d3ae73] pt-8">
							<div className="relative rotate-[-0.5deg] bg-[#fff4d8] p-6 shadow-[4px_5px_0_rgba(92,67,41,0.10)]">
								<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-[2deg]" />

								<p className="moodify-hand text-sm font-bold uppercase tracking-[0.15em] text-[#c7253b]">
									moodify says...
								</p>

								<h2 className="moodify-hand mt-3 text-2xl font-bold text-[#201914]">
									A little music note for you
								</h2>

								<div className="mt-5">
									<p className="moodify-hand text-lg font-bold text-[#c7253b]">
										Emotional Summary
									</p>

									<p className="mt-2 leading-7 text-[#4a3d33]">
										{analysis.emotional_summary}
									</p>
								</div>

								<div className="mt-6">
									<p className="moodify-hand text-lg font-bold text-[#c7253b]">
										Music Direction
									</p>

									<p className="mt-2 leading-7 text-[#4a3d33]">
										{analysis.music_recommendation}
									</p>
								</div>
							</div>
						</section>
					)}

					{/* PLAYLISTS */}
					{playlists.length > 0 && (
						<section className="mt-12 border-t-2 border-dashed border-[#d3ae73] pt-8">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
								<div>
									<p className="moodify-hand text-sm uppercase tracking-[0.15em] text-[#75685c]">
										your mixtapes
									</p>

									<h2 className="moodify-hand text-3xl font-bold text-[#c7253b]">
										Choose a Playlist
									</h2>

									<p className="mt-1 text-sm text-[#75685c]">
										Pick one to attach to this journal entry.
									</p>
								</div>

								<button
									type="button"
									onClick={handleGenerate}
									disabled={loading || completed}
									className="moodify-hand border-2 border-dashed border-[#c7253b] bg-[#fff9eb] px-4 py-2 font-bold text-[#c7253b] transition hover:bg-[#c7253b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
								>
									{loading
										? 'Refreshing...'
										: '↻ New Suggestions'}
								</button>
							</div>

							<div className="mt-7 grid gap-5 sm:grid-cols-2">
								{playlists.map((playlist, index) => {
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
											className={`relative flex items-center gap-4 p-4 text-left transition ${
												selected
													? 'rotate-[-1deg] border-2 border-[#c7253b] bg-[#fff4f1] shadow-[5px_5px_0_rgba(120,31,43,0.13)]'
													: 'border-2 border-dashed border-[#d3ae73] bg-[#fffdf5] hover:-translate-y-1'
											} ${
												index % 2 === 0
													? 'sm:rotate-[-0.4deg]'
													: 'sm:rotate-[0.4deg]'
											}`}
										>
											{playlist.image && (
												<img
													src={playlist.image}
													alt={playlist.name}
													className="h-20 w-20 shrink-0 object-cover shadow-sm"
												/>
											)}

											<div className="min-w-0 flex-1">
												<p className="moodify-hand truncate text-lg font-bold text-[#201914]">
													{playlist.name}
												</p>

												<a
													href={playlist.url}
													target="_blank"
													rel="noopener noreferrer"
													onClick={(event) =>
														event.stopPropagation()
													}
													className="mt-2 inline-block text-sm font-medium text-[#c7253b] hover:underline"
												>
													♪ Preview on Spotify
												</a>
											</div>

											<div
												className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
													selected
														? 'border-[#c7253b] bg-[#c7253b] text-white'
														: 'border-[#cba66c]'
												}`}
											>
												{selected && '✓'}
											</div>
										</button>
									)
								})}
							</div>

							<div className="mt-8 flex justify-center">
								<button
									type="button"
									onClick={handleSavePlaylist}
									disabled={
										!selectedPlaylist ||
										saving ||
										completed
									}
									className="moodify-button moodify-hand min-w-[230px] px-6 py-3 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
								>
									{saving
										? 'Saving...'
										: completed
											? 'Playlist Saved ✓'
											: 'Save Selected Playlist'}
								</button>
							</div>
						</section>
					)}

					{/* COMPLETED */}
					{completed && entryId && (
						<section className="relative mt-10 rotate-[0.5deg] border-2 border-dashed border-[#7b8c57] bg-[#f3f2d9] p-6 text-center">
							<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg]" />

							<p className="moodify-hand text-2xl font-bold text-[#5e6d40]">
								Journal + playlist saved!
							</p>

							<p className="mt-2 text-sm text-[#75685c]">
								Your little memory is safely tucked away.
							</p>

							<div className="mt-5 flex flex-wrap justify-center gap-3">
								<Link
									href={`/journal/${entryId}`}
									className="moodify-button moodify-hand px-5 py-2 font-bold"
								>
									View Journal
								</Link>

								<Link
									href="/dashboard"
									className="moodify-hand border-2 border-dashed border-[#c7253b] bg-[#fff9eb] px-5 py-2 font-bold text-[#c7253b]"
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