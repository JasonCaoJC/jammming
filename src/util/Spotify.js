const clientId = '' //Insert your client ID here
const redirectUri = 'https://react-jammming-demo.surge.sh/'
let accessToken

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken
        }
        //Check for access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/)
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/)

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1]
            const expiresIn = Number(expiresInMatch[1])
            //Clear the parameters from the URL, allowing us to grab a new access token when it expires
            window.setTimeout(() => accessToken = '', expiresIn * 1000)
            window.history.pushState('Access Token', null, '/')
            return accessToken
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
            window.location = accessUrl
        }
    },

    async search(term) {
        const endpoint = `https://api.spotify.com/v1/search?type=track&q=${term}`
        const accessToken = Spotify.getAccessToken()
        try {
            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (response.ok) {
                console.log('Response Ok')
                const jsonResponse = await response.json()
                if (!jsonResponse.tracks) {
                    return []
                }
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }))
            }
            throw new Error('Request Failed!')
        } catch (error) {
            console.log(error)
        }
    },

    async savePlaylist(name, trackURIs) {
        if (!(name && trackURIs)) {
            return
        }
        const accessToken = Spotify.getAccessToken()
        const headers = {
            Authorization: `Bearer ${accessToken}`
        }
        const getIdEndpoint = 'https://api.spotify.com/v1/me'
        let userId
        try {
            const response = await fetch(getIdEndpoint, { headers: headers })
            if (response.ok) {
                const jsonResponse = await response.json()
                userId = jsonResponse.id
                const createPlaylistEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`
                const postResponse = await fetch(createPlaylistEndpoint, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ name: name })
                })
                if (postResponse.ok) {
                    const jsonPostResponse = await postResponse.json()
                    const playlistID = jsonPostResponse.id
                    const addTracksToPlaylistEndpoint = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`
                    const newPostResponse = await fetch(addTracksToPlaylistEndpoint, {
                        headers: headers,
                        method: 'POST',
                        body: JSON.stringify( {uris: trackURIs})
                    })
                    if (newPostResponse.ok) {
                        alert('Successfully saved to your playlist.')
                    }
                    throw new Error('Request Failed!')
                } throw new Error('Request Failed!')
            }
            throw new Error('Request Failed!')
        } catch (error) {
            console.log(error)
        }
    }
}

export default Spotify