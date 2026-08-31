'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
			<main className="moodify-kraft min-h-screen px-6 py-10">
				<div className="mx-auto max-w-5xl">
					<div className="moodify-paper moodify-paper-edge relative p-8">
						<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

						<p className="moodify-hand text-center text-lg text-[#75685c]">
							Opening your journal...
						</p>
					</div>
				</div>
			</main>
		)
	}

	return (
		<main className="moodify-kraft min-h-screen px-4 py-8 sm:px-6 sm:py-10">
			<div className="mx-auto max-w-5xl">

				{/* HEADER */}
				<header className="moodify-paper moodify-paper-edge relative px-6 py-5 sm:px-8">
					<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-5">
							<Image
								src="/moodifyLOGO.svg"
								alt="Moodify"
								width={155}
								height={70}
								priority
								className="h-auto w-[135px] sm:w-[155px]"
							/>

							<div className="hidden h-10 border-l-2 border-dashed border-[#cba66c] sm:block" />

							<div>
								<p className="moodify-hand text-lg text-[#75685c]">
									welcome back,
								</p>

								<h1 className="moodify-hand text-3xl font-bold text-[#c7253b]">
									{name}
								</h1>
							</div>
						</div>

						<SignOutButton />
					</div>
				</header>

				{/* NEW ENTRY NOTE */}
				<section className="relative mt-10">
					<div className="moodify-paper moodify-paper-edge relative px-6 py-7 sm:px-8">
						<div className="moodify-tape left-10 top-0 -translate-y-1/2 rotate-[-6deg]" />

						<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="moodify-hand text-sm font-bold uppercase tracking-[0.2em] text-[#c7253b]">
									today&apos;s page
								</p>

								<h2 className="moodify-hand mt-2 text-2xl font-bold text-[#201914] sm:text-3xl">
									How are you feeling today?
								</h2>

								<p className="mt-2 max-w-xl text-sm leading-6 text-[#75685c]">
									Write down what&apos;s on your mind and let Moodify
									find music that fits your moment.
								</p>
							</div>

							<Link
								href="/journal/new"
								className="moodify-button moodify-hand inline-flex shrink-0 items-center justify-center px-6 py-3 text-lg font-bold italic"
							>
								+ New Entry
							</Link>
						</div>
					</div>
				</section>

				{/* RECENT ENTRIES */}
				<section className="mt-10">
					<div className="mb-5 flex items-end justify-between gap-4">
						<div>
							<p className="moodify-hand text-sm uppercase tracking-[0.2em] text-[#75685c]">
								from your journal
							</p>

							<h2 className="moodify-hand text-3xl font-bold text-[#c7253b]">
								Recent Entries
							</h2>
						</div>

						{entries.length > 0 && (
							<div className="moodify-stamp hidden h-16 w-16 text-xs sm:flex">
								{entries.length}
								<br />
								entries
							</div>
						)}
					</div>

					{entries.length > 0 ? (
						<div className="grid gap-6 md:grid-cols-2">
							{entries.map((entry, index) => (
								<Link
									key={entry.id}
									href={`/journal/${entry.id}`}
									className={`moodify-paper moodify-paper-edge group relative block p-6 transition duration-200 hover:-translate-y-1 ${
										index % 2 === 0
											? 'rotate-[-0.4deg]'
											: 'rotate-[0.4deg]'
									}`}
								>
									<div
										className={`moodify-tape top-0 -translate-y-1/2 ${
											index % 2 === 0
												? 'left-8 rotate-[-5deg]'
												: 'right-8 rotate-[5deg]'
										}`}
									/>

									<div className="flex items-start justify-between gap-4">
										<div className="inline-block border-2 border-[#c7253b] px-3 py-1">
											<span className="moodify-hand font-bold capitalize text-[#c7253b]">
												{entry.mood}
											</span>
										</div>

										<div className="text-right">
											<p className="moodify-hand text-sm font-bold text-[#75685c]">
												{new Date(
													entry.entry_date
												).toLocaleDateString(
													'en-US',
													{
														month: 'short',
														day: 'numeric',
													}
												)}
											</p>

											<p className="mt-1 text-xs text-[#9b8b7d]">
												{new Date(
													entry.entry_date
												).toLocaleDateString(
													'en-US',
													{
														year: 'numeric',
													}
												)}
											</p>
										</div>
									</div>

									<div className="mt-5 border-t border-dashed border-[#d8b980] pt-5">
										<p className="line-clamp-4 leading-7 text-[#3d332b]">
											{entry.content}
										</p>
									</div>

									<div className="mt-6 flex items-center justify-between gap-3">
										{entry.playlist_strategy && (
											<span className="text-xs text-[#8c7969]">
												♪
												{' '}
												{entry.playlist_strategy === 'cheer_up'
													? 'Cheer me up'
													: 'Match my mood'}
											</span>
										)}

										<span className="moodify-hand ml-auto font-bold text-[#c7253b] transition group-hover:translate-x-1">
											Read entry →
										</span>
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="moodify-paper moodify-paper-edge relative p-10 text-center">
							<div className="moodify-tape left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />

							<p className="text-4xl">
								✎
							</p>

							<h3 className="moodify-hand mt-3 text-2xl font-bold text-[#201914]">
								Your journal is still blank
							</h3>

							<p className="mt-2 text-sm text-[#75685c]">
								Start with whatever is on your mind today.
							</p>

							<Link
								href="/journal/new"
								className="moodify-hand mt-5 inline-block font-bold text-[#c7253b] hover:underline"
							>
								Write your first entry →
							</Link>
						</div>
					)}
				</section>
			</div>
		</main>
	)
}