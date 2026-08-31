'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type DeleteEntryButtonProps = {
	entryId: string
}

export default function DeleteEntryButton({
	entryId,
}: DeleteEntryButtonProps) {
	const router = useRouter()

	async function handleDelete() {
		const confirmed = window.confirm(
			'Are you sure you want to delete this journal entry?'
		)

		if (!confirmed) {
			return
		}

		const supabase = createClient()

		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user) {
			router.replace('/login')
			return
		}

		const { error } = await supabase
			.from('journal_entries')
			.delete()
			.eq('id', entryId)
			.eq('user_id', user.id)

		if (error) {
			alert(error.message)
			return
		}

		router.replace('/dashboard')
		router.refresh()
	}

	return (
		<button
			type="button"
			onClick={handleDelete}
			className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
		>
			Delete Entry
		</button>
	)
}