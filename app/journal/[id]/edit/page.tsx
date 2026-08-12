import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateJournalEntry } from '../actions'

type EditJournalPageProps = {
	params: Promise<{
		id: string
	}>
	searchParams: Promise<{
		error?: string
	}>
}

const moods = [
	{
		value: 'happy',
		emoji: '😊',
		label: 'Happy',
	},
	{
		value: 'content',
		emoji: '🙂',
		label: 'Content',
	},
	{
		value: 'neutral',
		emoji: '😐',
		label: 'Neutral',
	},
	{
		value: 'sad',
		emoji: '😔',
		label: 'Sad',
	},
	{
		value: 'depressed',
		emoji: '🌧️',
		label: 'Depressed',
	},
]

export default async function EditJournalPage({
	params,
	searchParams,
}: EditJournalPageProps) {
	const { id } = await params
	const query = await searchParams

	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const { data: entry, error } = await supabase
		.from('journal_entries')
		.select('id, mood, content, playlist_strategy')
		.eq('id', id)
		.eq('user_id', user.id)
		.single()

	if (error || !entry) {
		notFound()
	}

	return (
		<main className="min-h-screen bg-offwhite px-6 py-10">
			<div className="mx-auto max-w-2xl">
				<Link
					href={`/journal/${entry.id}`}
					className="text-sm font-medium text-periwinkle"
				>
					← Back to entry
				</Link>

				<div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
					<h1 className="text-3xl font-bold text-periwinkle">
						Edit Journal Entry
					</h1>

					<p className="mt-2 text-gray-500">
						Update how you felt or what you wrote.
					</p>

					{query.error && (
						<div className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
							{query.error}
						</div>
					)}

					<form
						action={updateJournalEntry.bind(null, entry.id)}
						className="mt-8 space-y-8"
					>
						<section>
							<h2 className="font-semibold text-gray-800">
								Choose your mood
							</h2>

							<div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
								{moods.map((mood) => (
									<label
										key={mood.value}
										className="cursor-pointer rounded-2xl border border-gray-200 p-4 text-center"
									>
										<input
											type="radio"
											name="mood"
											value={mood.value}
											defaultChecked={entry.mood === mood.value}
											required
											className="mb-2"
										/>

										<div className="text-2xl">
											{mood.emoji}
										</div>

										<div className="mt-1 text-sm font-medium text-gray-700">
											{mood.label}
										</div>
									</label>
								))}
							</div>
						</section>

						<section>
							<label
								htmlFor="content"
								className="font-semibold text-gray-800"
							>
								What&apos;s on your mind?
							</label>

							<textarea
								id="content"
								name="content"
								required
								rows={8}
								defaultValue={entry.content}
								className="mt-3 w-full resize-none rounded-2xl border border-gray-300 p-4 outline-none focus:border-periwinkle"
							/>
						</section>

						<section>
							<h2 className="font-semibold text-gray-800">
								What kind of music do you want?
							</h2>

							<div className="mt-3 space-y-3">
								<label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4">
									<input
										type="radio"
										name="playlist_strategy"
										value="match"
										defaultChecked={
											entry.playlist_strategy === 'match'
										}
										required
									/>

									<div>
										<p className="font-medium text-gray-800">
											Match my mood
										</p>

										<p className="text-sm text-gray-500">
											Recommend music that fits how I feel.
										</p>
									</div>
								</label>

								<label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4">
									<input
										type="radio"
										name="playlist_strategy"
										value="cheer_up"
										defaultChecked={
											entry.playlist_strategy === 'cheer_up'
										}
										required
									/>

									<div>
										<p className="font-medium text-gray-800">
											Cheer me up
										</p>

										<p className="text-sm text-gray-500">
											Recommend music that may help lift my mood.
										</p>
									</div>
								</label>
							</div>
						</section>

						<div className="flex gap-3">
							<button
								type="submit"
								className="rounded-xl bg-marigold px-5 py-3 font-semibold text-gray-800"
							>
								Save Changes
							</button>

							<Link
								href={`/journal/${entry.id}`}
								className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-600"
							>
								Cancel
							</Link>
						</div>
					</form>
				</div>
			</div>
		</main>
	)
}