import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <main className="min-h-screen bg-offwhite p-8">
        <h1 className="text-3xl font-bold text-periwinkle">
            Dashboard
        </h1>

        <p className="mt-4">
            Logged in as:
        </p>

        <p className="font-semibold">
            {user.email}
        </p>
        </main>
    )
}