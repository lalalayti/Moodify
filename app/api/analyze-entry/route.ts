import { NextResponse } from 'next/server'
import { Type } from '@google/genai'
import { createClient } from '@/lib/supabase/server'
import { gemini } from '@/lib/gemini'
import { searchSpotifyPlaylists } from '@/lib/spotify'

export async function POST(request: Request) {
	try {
		const supabase = await createClient()

		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const body = await request.json()

		const entryId = body.entryId

		const excludePlaylistIds =
			Array.isArray(body.excludePlaylistIds)
				? body.excludePlaylistIds
				: []

		if (!entryId) {
			return NextResponse.json(
				{ error: 'Journal entry ID is required.' },
				{ status: 400 }
			)
		}

		const { data: entry, error: entryError } = await supabase
			.from('journal_entries')
			.select(
				'id, mood, content, playlist_strategy, spotify_playlist_id'
			)
			.eq('id', entryId)
			.eq('user_id', user.id)
			.single()

		if (entryError || !entry) {
			return NextResponse.json(
				{ error: 'Journal entry not found.' },
				{ status: 404 }
			)
		}

		const strategy =
			entry.playlist_strategy === 'cheer_up'
				? 'Cheer the user up'
				: 'Match the user\'s current mood'

		const prompt = `
Analyze this private journal entry for music recommendation purposes.

User-selected mood:
${entry.mood}

Playlist strategy:
${strategy}

Journal entry:
${entry.content}

Return:
- a short emotional summary written directly to the person using "you"
- a music recommendation that starts with "You need to listen to..."
- 3 to 5 useful Spotify search terms

Do not refer to the person as "the user."
Do not write in third person.
Do not diagnose the person.
Do not make medical, neurological, hormonal, or physiological claims.
Describe only the desired musical mood, energy, style, and atmosphere.
Keep the tone warm, natural, supportive, and concise.
`

		const response = await gemini.models.generateContent({
			model: 'gemini-3-flash-preview',
			contents: prompt,
			config: {
				responseMimeType: 'application/json',
				responseSchema: {
					type: Type.OBJECT,
					properties: {
						emotional_summary: {
							type: Type.STRING,
						},
						music_recommendation: {
							type: Type.STRING,
						},
						search_terms: {
							type: Type.ARRAY,
							items: {
								type: Type.STRING,
							},
						},
					},
					required: [
						'emotional_summary',
						'music_recommendation',
						'search_terms',
					],
				},
			},
		})

		if (!response.text) {
			return NextResponse.json(
				{ error: 'Gemini did not return a response.' },
				{ status: 500 }
			)
		}

		const analysis = JSON.parse(response.text)

		const searchTerms = analysis.search_terms as string[]

		if (!searchTerms || searchTerms.length === 0) {
			return NextResponse.json(
				{ error: 'Gemini did not generate music search terms.' },
				{ status: 500 }
			)
		}

		const playlistMap = new Map()

		for (const searchTerm of searchTerms) {
			const playlists =
				await searchSpotifyPlaylists(searchTerm)

			for (const playlist of playlists) {
				const alreadyShown =
					excludePlaylistIds.includes(playlist.id)

				if (
					!alreadyShown &&
					!playlistMap.has(playlist.id)
				) {
					playlistMap.set(
						playlist.id,
						playlist
					)
				}
			}

			if (playlistMap.size >= 5) {
				break
			}
		}

		const suggestedPlaylists =
			Array.from(playlistMap.values()).slice(0, 5)

		if (suggestedPlaylists.length === 0) {
			return NextResponse.json(
				{
					error:
						'No matching Spotify playlists were found.',
				},
				{ status: 404 }
			)
		}

		const reasoning = [
			analysis.emotional_summary,
			analysis.music_recommendation,
			`Search Terms: ${analysis.search_terms.join(', ')}`,
		].join('\n\n')

		const { error: updateError } = await supabase
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
			.eq('id', entry.id)
			.eq('user_id', user.id)

		if (updateError) {
			return NextResponse.json(
				{ error: updateError.message },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			analysis,
			playlists: suggestedPlaylists.map(
				(playlist) => ({
					id: playlist.id,
					name: playlist.name,
					url:
						playlist.external_urls.spotify,
					image:
						playlist.images[0]?.url ??
						null,
				})
			),
		})
	} catch (error) {
		console.error(
			'Gemini + Spotify error:',
			error
		)

		return NextResponse.json(
			{
				error:
					'Failed to generate playlist recommendations.',
			},
			{ status: 500 }
		)
	}
}