import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
		const playlist = body.playlist

		if (!entryId || !playlist) {
			return NextResponse.json(
				{ error: 'Entry and playlist are required.' },
				{ status: 400 }
			)
		}

		const { error } = await supabase
			.from('journal_entries')
			.update({
				spotify_playlist_id: playlist.id,
				spotify_playlist_name: playlist.name,
				spotify_playlist_url: playlist.url,
				spotify_playlist_image: playlist.image ?? null,
			})
			.eq('id', entryId)
			.eq('user_id', user.id)

		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 500 }
			)
		}

		return NextResponse.json({
			success: true,
		})
	} catch (error) {
		console.error('Save playlist error:', error)

		return NextResponse.json(
			{ error: 'Failed to save playlist.' },
			{ status: 500 }
		)
	}
}