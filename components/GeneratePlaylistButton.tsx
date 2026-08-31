'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Playlist = {
	id: string
	name: string
	url: string
	image: string | null
}

type GeneratePlaylistButtonProps = {
	entryId: string
	hasAnalysis?: boolean
}

export default function GeneratePlaylistButton({
	entryId,
	hasAnalysis = false,
}: GeneratePlaylistButtonProps) {
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [playlists, setPlaylists] = useState<Playlist[]>([])
	const [seenPlaylistIds, setSeenPlaylistIds] = useState<string[]>([])
	const [savingId, setSavingId] = useState<string | null>(null)
	const [showRefresh, setShowRefresh] = useState(false)

	async function handleGenerate() {
		setLoading(true)
		setError('')
		setPlaylists([])

		if (hasAnalysis) {
			setShowRefresh(true)
		}

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

			const { data: entry, error: entryError } =
				await supabase
					.from('journal_entries')
					.select('mood, content, playlist_strategy')
					.eq('id', entryId)
					.eq('user_id', user.id)
					.single()

			if (entryError || !entry) {
				throw new Error('Journal entry not found.')
			}

			const response = await fetch('/api/analyze-entry', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					mood: entry.mood,
					content: entry.content,
					playlistStrategy:
						entry.playlist_strategy,
					excludePlaylistIds:
						seenPlaylistIds,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error || 'Something went wrong.'
				)
			}

			const analysis = data.analysis

			const reasoning = [
				analysis.emotional_summary,
				analysis.music_recommendation,
				`Search Terms: ${analysis.search_terms.join(', ')}`,
			].join('\n\n')

			const { error: updateError } =
				await supabase
					.from('journal_entries')
					.update({
						ai_reasoning: reasoning,
						ai_emotional_summary:
							analysis.emotional_summary,
						ai_music_direction:
							analysis.music_recommendation,
						ai_search_terms:
							analysis.search_terms,
					})
					.eq('id', entryId)
					.eq('user_id', user.id)

			if (updateError) {
				throw new Error(updateError.message)
			}

			const newPlaylists =
				(data.playlists ?? []) as Playlist[]

			setPlaylists(newPlaylists)

			setSeenPlaylistIds((previous) => [
				...new Set([
					...previous,
					...newPlaylists.map(
						(playlist) => playlist.id
					),
				]),
			])

			router.refresh()
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

	async function handleSavePlaylist(
		playlist: Playlist
	) {
		setSavingId(playlist.id)
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
							playlist.id,
						spotify_playlist_name:
							playlist.name,
						spotify_playlist_url:
							playlist.url,
						spotify_playlist_image:
							playlist.image,
					})
					.eq('id', entryId)
					.eq('user_id', user.id)

			if (saveError) {
				throw new Error(saveError.message)
			}

			setPlaylists([])

			window.location.reload()
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('Something went wrong.')
			}
		} finally {
			setSavingId(null)
		}
	}

	return (
		<div>
			<div className="flex flex-wrap gap-3">
				<button
					type="button"
					onClick={handleGenerate}
					disabled={loading}
					className="moodify-button moodify-hand px-5 py-3 text-lg font-bold italic disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading
						? 'Finding Playlists...'
						: hasAnalysis
							? 'Generate Again'
							: '♪ Generate Playlists'}
				</button>

				{showRefresh && (
					<button
						type="button"
						onClick={handleGenerate}
						disabled={loading}
						className="moodify-hand border-2 border-dashed border-[#c7253b] bg-[#fff9eb] px-5 py-3 font-bold text-[#c7253b] transition hover:bg-[#c7253b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading
							? 'Refreshing...'
							: '↻ Refresh Suggestions'}
					</button>
				)}
			</div>

			{error && (
				<div className="mt-4 border-2 border-dashed border-[#c7253b] bg-[#fff1f1] px-4 py-3 text-sm text-[#a91f32]">
					{error}
				</div>
			)}

			{playlists.length > 0 && (
				<div className="mt-8">
					<div>
						<p className="moodify-hand text-sm uppercase tracking-[0.15em] text-[#75685c]">
							new suggestions
						</p>

						<h3 className="moodify-hand mt-1 text-2xl font-bold text-[#c7253b]">
							Choose a playlist
						</h3>
					</div>

					<div className="mt-5 grid gap-5 sm:grid-cols-2">
						{playlists.map((playlist, index) => (
							<div
								key={playlist.id}
								className={`relative border-2 border-dashed border-[#d3ae73] bg-[#fffdf5] p-4 shadow-[4px_4px_0_rgba(92,67,41,0.08)] ${
									index % 2 === 0
										? 'rotate-[-0.5deg]'
										: 'rotate-[0.5deg]'
								}`}
							>
								<div className="moodify-tape left-7 top-0 -translate-y-1/2 rotate-[-5deg]" />

								<div className="flex items-center gap-4">
									{playlist.image && (
										<div className="shrink-0 bg-white p-1.5 shadow-sm">
											<img
												src={playlist.image}
												alt={playlist.name}
												className="h-20 w-20 object-cover"
											/>
										</div>
									)}

									<div className="min-w-0 flex-1">
										<p className="moodify-hand truncate text-lg font-bold text-[#201914]">
											{playlist.name}
										</p>

										<a
											href={playlist.url}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-1 inline-block text-sm font-medium text-[#c7253b] hover:underline"
										>
											♪ Preview on Spotify
										</a>
									</div>
								</div>

								<button
									type="button"
									onClick={() =>
										handleSavePlaylist(
											playlist
										)
									}
									disabled={savingId !== null}
									className="moodify-hand mt-4 w-full border-2 border-dashed border-[#c7253b] bg-[#fff9eb] px-4 py-2 font-bold text-[#c7253b] transition hover:bg-[#c7253b] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
								>
									{savingId === playlist.id
										? 'Saving...'
										: 'Save Playlist'}
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}