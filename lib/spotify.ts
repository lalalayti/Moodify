type SpotifyTokenResponse = {
	access_token: string
	token_type: string
	expires_in: number
}

type SpotifyPlaylist = {
	id: string
	name: string
	external_urls: {
		spotify: string
	}
	images: {
		url: string
		height: number | null
		width: number | null
	}[]
}

type SpotifySearchResponse = {
	playlists: {
		items: (SpotifyPlaylist | null)[]
	}
}

export async function getSpotifyAccessToken() {
	const clientId = process.env.SPOTIFY_CLIENT_ID
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

	if (!clientId || !clientSecret) {
		throw new Error('Spotify credentials are missing.')
	}

	const credentials = Buffer.from(
		`${clientId}:${clientSecret}`
	).toString('base64')

	const response = await fetch(
		'https://accounts.spotify.com/api/token',
		{
			method: 'POST',
			headers: {
				Authorization: `Basic ${credentials}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'client_credentials',
			}),
			cache: 'no-store',
		}
	)

	if (!response.ok) {
		const errorText = await response.text()

		console.error('Spotify token error:', errorText)

		throw new Error(
			'Failed to get Spotify access token.'
		)
	}

	const data =
		(await response.json()) as SpotifyTokenResponse

	return data.access_token
}

export async function searchSpotifyPlaylists(
	searchTerm: string
) {
	const accessToken = await getSpotifyAccessToken()

	const params = new URLSearchParams({
		q: searchTerm,
		type: 'playlist',
		limit: '10',
	})

	const response = await fetch(
		`https://api.spotify.com/v1/search?${params.toString()}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			cache: 'no-store',
		}
	)

	if (!response.ok) {
		const errorText = await response.text()

		console.error('Spotify search error:', errorText)

		throw new Error(
			'Failed to search Spotify playlists.'
		)
	}

	const data =
		(await response.json()) as SpotifySearchResponse

	return data.playlists.items.filter(
		(playlist): playlist is SpotifyPlaylist =>
			playlist !== null
	)
}