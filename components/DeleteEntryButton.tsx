'use client'

type DeleteEntryButtonProps = {
	entryId: string
	deleteAction: (id: string) => Promise<void>
}

export default function DeleteEntryButton({
	entryId,
	deleteAction,
}: DeleteEntryButtonProps) {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		const confirmed = window.confirm(
			'Are you sure you want to delete this journal entry?'
		)

		if (!confirmed) {
			event.preventDefault()
		}
	}

	return (
		<form
			action={deleteAction.bind(null, entryId)}
			onSubmit={handleSubmit}
		>
			<button
				type="submit"
				className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
			>
				Delete Entry
			</button>
		</form>
	)
}