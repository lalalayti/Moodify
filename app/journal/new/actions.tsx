'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createJournalEntry(formData: FormData) {
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

	const { error } = await supabase.from('journal_entries').insert({
    user_id: user.id,
    mood,
    content,
    playlist_strategy: playlistStrategy,
    })

	if (error) {
		redirect(`/journal/new?error=${encodeURIComponent(error.message)}`)
	}

	redirect('/dashboard')
}