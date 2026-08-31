'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import DeleteEntryButton from '@/components/DeleteEntryButton'
import GeneratePlaylistButton from '@/components/GeneratePlaylistButton'

type JournalEntry = {
	id: string
	entry_date: string
	entry_time: string | null
	mood: string
	content: string
	playlist_strategy: string | null
	ai_reasoning: string | null
	ai_emotional_summary: string | null
	ai_music_direction: string | null
	ai_search_terms: string[] | null
	spotify_playlist_id: string | null
	spotify_playlist_name: string | null
	spotify_playlist_url: string | null
	spotify_playlist_image: string | null
}

export default function JournalPage() {
	const params = useParams<{ id: string }>()
	const router = useRouter()

	const [entry, setEntry] = useState<JournalEntry | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

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
				.select(
					'id, entry_date, entry_time, mood, content, playlist_strategy, ai_reasoning, ai_emotional_summary, ai_music_direction, ai_search_terms, spotify_playlist_id, spotify_playlist_name, spotify_playlist_url, spotify_playlist_image'
				)
				.eq('id', params.id)
				.eq('user_id', user.id)
				.single()

			if (error || !data) {
				setError('Journal entry not found.')
				setLoading(false)
				return
			}

			setEntry(data)
			setLoading(false)
		}

		loadEntry()
	}, [params.id, router])

	if (loading) {
		return (
			<main className="moodify-kraft min-h-screen px-4 py-10 sm:px-6">
				<div className="mx-auto max-w-4xl">
					<div className="moodify-paper moodify-paper-edge relative p-8">
						<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

						<p className="moodify-hand text-center text-lg text-[#75685c]">
							Opening your journal entry...
						</p>
					</div>
				</div>
			</main>
		)
	}

	if (error || !entry) {
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

	const formattedDate = new Date(
		entry.entry_date
	).toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	})

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

				{/* MAIN JOURNAL PAGE */}
				<article className="moodify-paper moodify-paper-edge relative px-5 py-8 sm:px-10 sm:py-10">
					<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-[2deg]" />

					{/* ENTRY HEADER */}
					<div className="border-b-2 border-dashed border-[#d3ae73] pb-7">
						<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="moodify-hand text-sm uppercase tracking-[0.18em] text-[#75685c]">
									journal entry
								</p>

								<h1 className="moodify-hand mt-2 text-4xl font-bold capitalize text-[#c7253b]">
									{entry.mood}
								</h1>

								<p className="mt-2 text-sm text-[#75685c]">
									{formattedDate}
								</p>
							</div>

							<div className="flex items-start gap-4">
								{entry.entry_time && (
									<div className="rotate-[2deg] border-2 border-dashed border-[#c7253b] px-4 py-2 text-center">
										<p className="moodify-hand text-xs uppercase text-[#75685c]">
											time
										</p>

										<p className="moodify-hand font-bold text-[#c7253b]">
											{entry.entry_time.slice(0, 5)}
										</p>
									</div>
								)}

								<div className="moodify-stamp h-16 w-16 text-xs font-bold">
									saved
								</div>
							</div>
						</div>
					</div>

					{/* JOURNAL ENTRY */}
					<section className="mt-9">
						<h2 className="moodify-hand text-2xl font-bold text-[#c7253b]">
							What was on your mind
						</h2>

						<div
							className="relative mt-5 min-h-[220px] border-2 border-dashed border-[#d3ae73] bg-[#fffdf5] px-5 py-6"
							style={{
								backgroundImage:
									'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(199,37,59,0.09) 32px)',
							}}
						>
							<div className="moodify-tape left-8 top-0 -translate-y-1/2 rotate-[-4deg]" />

							<p className="whitespace-pre-wrap leading-8 text-[#3d332b]">
								{entry.content}
							</p>
						</div>
					</section>

					{/* PLAYLIST PREFERENCE */}
					{entry.playlist_strategy && (
						<section className="mt-9 border-t-2 border-dashed border-[#d3ae73] pt-7">
							<p className="moodify-hand text-sm uppercase tracking-[0.16em] text-[#75685c]">
								music choice
							</p>

							<div className="mt-3 inline-block rotate-[-1deg] bg-[#fff4d8] px-5 py-3 shadow-[4px_4px_0_rgba(92,67,41,0.08)]">
								<p className="moodify-hand text-lg font-bold text-[#201914]">
									♪
									{' '}
									{entry.playlist_strategy === 'cheer_up'
										? 'Cheer me up'
										: 'Match my mood'}
								</p>
							</div>
						</section>
					)}

					{/* AI ANALYSIS */}
					<section className="mt-9 border-t-2 border-dashed border-[#d3ae73] pt-8">
						<h2 className="moodify-hand text-2xl font-bold text-[#c7253b]">
							Moodify&apos;s note
						</h2>

						{entry.ai_reasoning ? (
							<div className="mt-5">
								<div className="relative rotate-[0.4deg] bg-[#fff4d8] p-6 shadow-[5px_5px_0_rgba(92,67,41,0.10)]">
									<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-[3deg]" />

									<p className="moodify-hand text-sm font-bold uppercase tracking-[0.15em] text-[#c7253b]">
										a little music note for you
									</p>

									<p className="mt-4 whitespace-pre-wrap leading-7 text-[#4a3d33]">
										{entry.ai_reasoning}
									</p>
								</div>

								<div className="mt-6">
									<GeneratePlaylistButton
										entryId={entry.id}
										hasAnalysis={true}
									/>
								</div>
							</div>
						) : (
							<div className="mt-5 border-2 border-dashed border-[#d3ae73] bg-[#fffaf0] p-5">
								<p className="mb-4 text-[#75685c]">
									Generate a music recommendation based on your mood
									and journal entry.
								</p>

								<GeneratePlaylistButton
									entryId={entry.id}
									hasAnalysis={false}
								/>
							</div>
						)}
					</section>

					{/* SAVED PLAYLIST */}
					{entry.spotify_playlist_id &&
						entry.spotify_playlist_name &&
						entry.spotify_playlist_url && (
							<section className="mt-10 border-t-2 border-dashed border-[#d3ae73] pt-8">
								<p className="moodify-hand text-sm uppercase tracking-[0.16em] text-[#75685c]">
									your soundtrack
								</p>

								<h2 className="moodify-hand mt-1 text-3xl font-bold text-[#c7253b]">
									Saved Playlist
								</h2>

								<div className="relative mt-6 rotate-[-0.5deg] border-2 border-dashed border-[#d3ae73] bg-[#fffdf5] p-5 shadow-[5px_5px_0_rgba(92,67,41,0.08)]">
									<div className="moodify-tape left-10 top-0 -translate-y-1/2 rotate-[-5deg]" />

									<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
										{entry.spotify_playlist_image && (
											<div className="shrink-0 bg-white p-2 shadow-md">
												<img
													src={entry.spotify_playlist_image}
													alt={entry.spotify_playlist_name}
													className="h-36 w-36 object-cover sm:h-32 sm:w-32"
												/>
											</div>
										)}

										<div className="min-w-0 flex-1">
											<p className="moodify-hand text-sm font-bold uppercase tracking-[0.15em] text-[#75685c]">
												Spotify Playlist
											</p>

											<h3 className="moodify-hand mt-2 text-2xl font-bold text-[#201914]">
												{entry.spotify_playlist_name}
											</h3>

											<a
												href={entry.spotify_playlist_url}
												target="_blank"
												rel="noopener noreferrer"
												className="moodify-button moodify-hand mt-5 inline-block px-5 py-2 font-bold"
											>
												♪ Open in Spotify
											</a>
										</div>
									</div>
								</div>
							</section>
						)}

					{/* ACTIONS */}
					<section className="mt-10 border-t-2 border-dashed border-[#d3ae73] pt-7">
						<div className="flex flex-wrap items-center gap-4">
							<Link
								href={`/journal/${entry.id}/edit`}
								className="moodify-button moodify-hand px-5 py-2 font-bold"
							>
								✎ Edit Entry
							</Link>

							<DeleteEntryButton entryId={entry.id} />
						</div>
					</section>
				</article>
			</div>
		</main>
	)
}