import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteJournalEntry } from './actions'
import DeleteEntryButton from '@/components/DeleteEntryButton'

type JournalPageProps = {
	params: Promise<{
		id: string
	}>
}

export default async function JournalPage({
	params,
}: JournalPageProps) {
	const { id } = await params

	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const { data: entry, error } = await supabase
		.from('journal_entries')
		.select(
			'id, entry_date, entry_time, mood, content, playlist_strategy, ai_reasoning, spotify_playlist_id, spotify_track_ids'
		)
		.eq('id', id)
		.eq('user_id', user.id)
		.single()

	if (error || !entry) {
		notFound()
	}

	const formattedDate = new Date(entry.entry_date).toLocaleDateString(
		'en-US',
		{
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}
	)

	return (
		<main className="min-h-screen bg-offwhite px-6 py-10">
			<div className="mx-auto max-w-3xl">
				<Link
					href="/dashboard"
					className="text-sm font-medium text-periwinkle"
				>
					← Back to dashboard
				</Link>

				<article className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
					<div className="flex flex-col gap-2 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-400">
								{formattedDate}
							</p>

							<h1 className="mt-1 text-3xl font-bold capitalize text-periwinkle">
								{entry.mood}
							</h1>
						</div>

						{entry.entry_time && (
							<p className="text-sm text-gray-400">
								{entry.entry_time.slice(0, 5)}
							</p>
						)}
					</div>

					<section className="mt-8">
						<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
							Journal Entry
						</h2>

						<p className="mt-4 whitespace-pre-wrap leading-8 text-gray-700">
							{entry.content}
						</p>
					</section>

					{entry.playlist_strategy && (
						<section className="mt-8 border-t border-gray-100 pt-6">
							<h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
								Playlist Preference
							</h2>

							<p className="mt-2 text-gray-700">
								{entry.playlist_strategy === 'cheer_up'
									? 'Cheer me up'
									: 'Match my mood'}
							</p>
						</section>
					)}
                    <section className="mt-8 border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/journal/${entry.id}/edit`}
                                className="rounded-xl bg-[#818bbe] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                Edit Entry
                            </Link>

                            <DeleteEntryButton
                                entryId={entry.id}
                                deleteAction={deleteJournalEntry}
                            />
                        </div>
                    </section>
				</article>
			</div>
		</main>
	)
}