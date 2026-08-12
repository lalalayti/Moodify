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

		const mood = body.mood
		const content = body.content
		const playlistStrategy = body.playlist_strategy

		if (!mood || !content || !playlistStrategy) {
			return NextResponse.json(
				{ error: 'All journal fields are required.' },
				{ status: 400 }
			)
		}

		const { data: entry, error } = await supabase
			.from('journal_entries')
			.insert({
				user_id: user.id,
				mood,
				content,
				playlist_strategy: playlistStrategy,
			})
			.select('id')
			.single()

		if (error || !entry) {
			return NextResponse.json(
				{
					error:
						error?.message ||
						'Failed to create journal entry.',
				},
				{ status: 500 }
			)
		}

		return NextResponse.json({
			entryId: entry.id,
		})
	} catch (error) {
		console.error('Create journal error:', error)

		return NextResponse.json(
			{ error: 'Failed to create journal entry.' },
			{ status: 500 }
		)
	}
}