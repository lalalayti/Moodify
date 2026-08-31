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
			className="moodify-hand border-2 border-dashed border-[#c7253b] bg-[#fff9eb] px-5 py-2 font-bold text-[#c7253b] shadow-[3px_3px_0_rgba(120,31,43,0.10)] transition hover:-translate-y-0.5 hover:bg-[#c7253b] hover:text-white"
		>
			✕ Delete Entry
		</button>
	)
}