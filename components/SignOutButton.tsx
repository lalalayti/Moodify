'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
	const router = useRouter()

	async function handleSignOut() {
		const supabase = createClient()

		await supabase.auth.signOut()

		router.push('/login')
		router.refresh()
	}

	return (
		<button
			onClick={handleSignOut}
			className="moodify-hand border-2 border-dashed border-[#c7253b] bg-[#fff9eb] px-4 py-2 font-bold text-[#c7253b] shadow-[3px_3px_0_rgba(120,31,43,0.12)] transition hover:-translate-y-0.5 hover:bg-[#c7253b] hover:text-white"
		>
			Log out
		</button>
	)
}