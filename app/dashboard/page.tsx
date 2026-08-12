import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

    const { data: entries } = await supabase
        .from('journal_entries')
        .select('id, entry_date, entry_time, mood, content, playlist_strategy')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <main className="min-h-screen bg-offwhite px-6 py-8">
        <div className="mx-auto max-w-4xl">
            <header className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Welcome back</p>

                <h1 className="text-3xl font-bold text-periwinkle">
                {profile?.name ?? 'User'}
                </h1>
            </div>

            <SignOutButton />
            </header>

            <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div>
                <h2 className="text-xl font-semibold text-gray-800">
                    How are you feeling today?
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Write down what&apos;s on your mind.
                </p>
                </div>

                <a
                href="/journal/new"
                className="rounded-xl bg-marigold px-5 py-3 font-semibold text-gray-800"
                >
                + New Entry
                </a>
            </div>
            </section>

            <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">
                Recent Entries
            </h2>

            {entries && entries.length > 0 ? (
                <div className="mt-4 space-y-4">
                {entries.map((entry) => (
                    <article
                    key={entry.id}
                    className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                    <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold capitalize text-periwinkle">
                        {entry.mood}
                        </span>

                        <span className="text-sm text-gray-400">
                        {entry.entry_date}
                        </span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-gray-700">
                        {entry.content}
                    </p>

                    {entry.playlist_strategy && (
                        <p className="mt-3 text-xs text-gray-400">
                        Playlist preference:{' '}
                        {entry.playlist_strategy === 'cheer_up'
                            ? 'Cheer me up'
                            : 'Match my mood'}
                        </p>
                    )}
                    </article>
                ))}
                </div>
            ) : (
                <div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                    You don&apos;t have any journal entries yet.
                </p>

                <a
                    href="/journal/new"
                    className="mt-4 inline-block font-semibold text-periwinkle"
                >
                    Write your first entry
                </a>
                </div>
            )}
            </section>
        </div>
        </main>
    )
}