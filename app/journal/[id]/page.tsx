'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
			<main className="min-h-screen bg-offwhite px-6 py-10">
				<div className="mx-auto max-w-3xl">
					<p className="text-gray-500">
						Loading journal entry...
					</p>
				</div>
			</main>
		)
	}

	if (error || !entry) {
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
						<p className="text-red-600">
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
		<main className="min-h-screen bg-offwhite px-6 py-10">
			<div className="mx-auto max-w-3xl">
				<Link
					href="/dashboard"
					className="text-sm font-medium text-[#818bbe]"
				>
					← Back to dashboard
				</Link>

				<article className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
					<div className="flex flex-col gap-2 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-400">
								{formattedDate}
							</p>

							<h1 className="mt-1 text-3xl font-bold capitalize text-[#818bbe]">
								{entry.mood}
							</h1>
						</div>

						{entry.entry_time && (
							<p className="text-sm text-gray-400">
								{entry.entry_time.slice(0, 5)}
							</p>
						)}
					</div>

					<section className="mt-8">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
							Journal Entry
						</h2>

						<p className="mt-4 whitespace-pre-wrap leading-8 text-gray-700">
							{entry.content}
						</p>
					</section>

					{entry.playlist_strategy && (
						<section className="mt-8 border-t border-gray-100 pt-6">
							<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
								Playlist Preference
							</h2>

							<p className="mt-2 text-gray-700">
								{entry.playlist_strategy === 'cheer_up'
									? 'Cheer me up'
									: 'Match my mood'}
							</p>
						</section>
					)}

					<section className="mt-8 border-t border-gray-100 pt-6">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
							AI Music Analysis
						</h2>

						{entry.ai_reasoning ? (
							<div className="mt-4">
								<div className="rounded-2xl bg-[#f7fbfe] p-5">
									<p className="whitespace-pre-wrap leading-7 text-gray-700">
										{entry.ai_reasoning}
									</p>
								</div>

								<div className="mt-5">
									<GeneratePlaylistButton
										entryId={entry.id}
										hasAnalysis={true}
									/>
								</div>
							</div>
						) : (
							<div className="mt-4">
								<p className="mb-4 text-gray-500">
									Generate a music recommendation based on
									your mood and journal entry.
								</p>

								<GeneratePlaylistButton
									entryId={entry.id}
									hasAnalysis={false}
								/>
							</div>
						)}
					</section>

					{entry.spotify_playlist_id &&
						entry.spotify_playlist_name &&
						entry.spotify_playlist_url && (
							<section className="mt-8 border-t border-gray-100 pt-6">
								<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
									Recommended Playlist
								</h2>

								<div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-[#f7fbfe]">
									<div className="flex items-center gap-5 p-5">
										{entry.spotify_playlist_image && (
											<img
												src={entry.spotify_playlist_image}
												alt={entry.spotify_playlist_name}
												className="h-24 w-24 rounded-xl object-cover"
											/>
										)}

										<div className="min-w-0 flex-1">
											<p className="text-sm text-gray-400">
												Spotify Playlist
											</p>

											<h3 className="mt-1 truncate text-xl font-semibold text-gray-800">
												{entry.spotify_playlist_name}
											</h3>

											<a
												href={entry.spotify_playlist_url}
												target="_blank"
												rel="noopener noreferrer"
												className="mt-4 inline-block rounded-xl bg-[#1DB954] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
											>
												Open in Spotify
											</a>
										</div>
									</div>
								</div>
							</section>
						)}

					<section className="mt-8 border-t border-gray-100 pt-6">
						<div className="flex items-center gap-3">
							<Link
								href={`/journal/${entry.id}/edit`}
								className="rounded-xl bg-[#818bbe] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
							>
								Edit Entry
							</Link>

							<DeleteEntryButton entryId={entry.id} />
						</div>
					</section>
				</article>
			</div>
		</main>
	)
}