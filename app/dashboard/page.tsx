'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SignOutButton from '@/components/SignOutButton'

type JournalEntry = {
	id: string
	entry_date: string
	entry_time: string
	mood: string
	content: string
	playlist_strategy: string | null
}

export default function DashboardPage() {
	const router = useRouter()

	const [name, setName] = useState('User')
	const [entries, setEntries] = useState<JournalEntry[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function loadDashboard() {
			const supabase = createClient()

			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser()

			if (userError || !user) {
				router.replace('/login')
				return
			}

			const { data: profile } = await supabase
				.from('profiles')
				.select('name')
				.eq('id', user.id)
				.single()

			if (profile?.name) {
				setName(profile.name)
			}

			const { data: journalEntries } = await supabase
				.from('journal_entries')
				.select(
					'id, entry_date, entry_time, mood, content, playlist_strategy'
				)
				.eq('user_id', user.id)
				.order('created_at', {
					ascending: false,
				})

			setEntries(journalEntries ?? [])
			setLoading(false)
		}

		loadDashboard()
	}, [router])

	if (loading) {
		return (
			<main className="min-h-screen bg-offwhite px-6 py-8">
				<div className="mx-auto max-w-4xl">
					<p className="text-gray-500">
						Loading...
					</p>
				</div>
			</main>
		)
	}

	return (
		<main className="min-h-screen bg-offwhite px-6 py-8">
			<div className="mx-auto max-w-4xl">
				<header className="flex items-center justify-between">
					<div>
						<p className="text-sm text-gray-500">
							Welcome back
						</p>

						<h1 className="text-3xl font-bold text-periwinkle">
							{name}
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

						<Link
							href="/journal/new"
							className="rounded-xl bg-marigold px-5 py-3 font-semibold text-gray-800"
						>
							+ New Entry
						</Link>
					</div>
				</section>

				<section className="mt-8">
					<h2 className="text-xl font-semibold text-gray-800">
						Recent Entries
					</h2>

					{entries.length > 0 ? (
						<div className="mt-4 space-y-4">
							{entries.map((entry) => (
								<Link
									key={entry.id}
									href={`/journal/${entry.id}`}
									className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
								>
									<div className="flex items-center justify-between gap-4">
										<span className="font-semibold capitalize text-periwinkle">
											{entry.mood}
										</span>

										<span className="text-sm text-gray-400">
											{new Date(
												entry.entry_date
											).toLocaleDateString(
												'en-US',
												{
													month: 'long',
													day: 'numeric',
													year: 'numeric',
												}
											)}
										</span>
									</div>

									<p className="mt-3 line-clamp-3 text-gray-700">
										{entry.content}
									</p>

									<p className="mt-3 text-sm font-medium text-periwinkle">
										Read full entry →
									</p>
								</Link>
							))}
						</div>
					) : (
						<div className="mt-4 rounded-2xl bg-white p-8 text-center shadow-sm">
							<p className="text-gray-500">
								You don&apos;t have any journal entries yet.
							</p>

							<Link
								href="/journal/new"
								className="mt-4 inline-block font-semibold text-periwinkle"
							>
								Write your first entry
							</Link>
						</div>
					)}
				</section>
			</div>
		</main>
	)
}