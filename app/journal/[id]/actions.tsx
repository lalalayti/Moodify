'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function deleteJournalEntry(id: string) {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const { error } = await supabase
		.from('journal_entries')
		.delete()
		.eq('id', id)
		.eq('user_id', user.id)

	if (error) {
		redirect(`/journal/${id}?error=${encodeURIComponent(error.message)}`)
	}

	redirect('/dashboard')
}

export async function updateJournalEntry(id: string, formData: FormData) {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const mood = formData.get('mood') as string
	const content = formData.get('content') as string
	const playlistStrategy = formData.get('playlist_strategy') as string

	const { error } = await supabase
		.from('journal_entries')
		.update({
			mood,
			content,
			playlist_strategy: playlistStrategy,
		})
		.eq('id', id)
		.eq('user_id', user.id)

	if (error) {
		redirect(
			`/journal/${id}/edit?error=${encodeURIComponent(error.message)}`
		)
	}

	redirect(`/journal/${id}`)
}