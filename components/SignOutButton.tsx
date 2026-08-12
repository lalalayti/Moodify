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
        className="rounded-xl border border-periwinkle px-4 py-2 font-medium text-periwinkle transition hover:bg-periwinkle hover:text-white"
    >
        Log out
    </button>
    )
}