'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
	const [savingId, setSavingId] = useState<string | null>(null)

	async function handleGenerate() {
		setLoading(true)
		setError('')
		setPlaylists([])

		try {
			const response = await fetch('/api/analyze-entry', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					entryId,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error || 'Something went wrong.'
				)
			}

			setPlaylists(data.playlists ?? [])

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

	async function handleSavePlaylist(playlist: Playlist) {
		setSavingId(playlist.id)
		setError('')

		try {
			const response = await fetch('/api/save-playlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					entryId,
					playlist,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error || 'Failed to save playlist.'
				)
			}

			setPlaylists([])

			router.refresh()
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
			<button
				type="button"
				onClick={handleGenerate}
				disabled={loading}
				className="rounded-xl bg-[#fbbd53] px-5 py-3 font-semibold text-gray-800 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading
					? 'Finding Playlists...'
					: hasAnalysis
						? 'Generate Again'
						: 'Generate Playlists'}
			</button>

			{error && (
				<p className="mt-3 text-sm text-red-600">
					{error}
				</p>
			)}

			{playlists.length > 0 && (
				<div className="mt-6">
					<h3 className="font-semibold text-gray-800">
						Choose a playlist
					</h3>

					<div className="mt-4 space-y-3">
						{playlists.map((playlist) => (
							<div
								key={playlist.id}
								className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4"
							>
								{playlist.image && (
									<img
										src={playlist.image}
										alt={playlist.name}
										className="h-16 w-16 rounded-xl object-cover"
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
										className="text-sm text-[#818bbe] hover:underline"
									>
										Preview on Spotify
									</a>
								</div>

								<button
									type="button"
									onClick={() =>
										handleSavePlaylist(playlist)
									}
									disabled={savingId !== null}
									className="rounded-xl bg-[#818bbe] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
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