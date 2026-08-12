import Link from 'next/link'
import { createJournalEntry } from './actions'

type NewJournalPageProps = {
    searchParams: Promise<{
        error?: string
    }>
}

const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'content', emoji: '🙂', label: 'Content' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'sad', emoji: '😔', label: 'Sad' },
    { value: 'depressed', emoji: '🌧️', label: 'Depressed' },
]

export default async function NewJournalPage({
    searchParams,
}: NewJournalPageProps) {
    const params = await searchParams
    return (
        <main className="min-h-screen bg-offwhite px-6 py-10">
        <div className="mx-auto max-w-2xl">
            <Link
            href="/dashboard"
            className="text-sm font-medium text-periwinkle"
            >
            ← Back to dashboard
            </Link>
            <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-periwinkle">
                New Journal Entry
            </h1>

            <p className="mt-2 text-gray-500">
                How are you feeling today?
            </p>

            {params.error && (
                <div className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
                {params.error}
                </div>
            )}

            <form action={createJournalEntry} className="mt-8 space-y-8">
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
                    placeholder="Write about your day..."
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
                <button
                type="submit"
                className="w-full rounded-2xl bg-marigold px-5 py-3 font-semibold text-gray-800"
                >
                Save Entry
                </button>
            </form>
            </div>
        </div>
        </main>
    )
}