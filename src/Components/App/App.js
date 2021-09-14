import React from 'react'
import './App.css';
import SearchBar from '../SearchBar/SearchBar'
import SearchResults from '../SearchResults/SearchResults'
import Playlist from '../Playlist/Playlist'
import Spotify from '../../util/Spotify'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchResults: [],
      playlistName: 'My Playlist',
      playlistTracks: []
    }
    this.addTrack = this.addTrack.bind(this)
    this.removeTrack = this.removeTrack.bind(this)
    this.updatePlaylistName = this.updatePlaylistName.bind(this)
    this.savePlaylist = this.savePlaylist.bind(this)
    this.search = this.search.bind(this)
  }

  addTrack(track) {
    let savedTracks = this.state.playlistTracks
    //Use the track’s id property to check if the current song is in the playlistTracks state.
    if (savedTracks.find(savedTrack => savedTrack.id === track.id)) {
      alert('Track was already added to playlist.')
      return
    }
    //If the id is new, add the song to the end of the playlist
    savedTracks.push(track)
    //Set the new state of the playlist
    this.setState({ playlistTracks: savedTracks })
  }

  removeTrack(track) {
    //Filter out track.id !important: filter does not modify the original array
    let savedTracks = this.state.playlistTracks.filter(savedTrack => savedTrack.id !== track.id)
    //Set the new state of the playlist
    this.setState({ playlistTracks: savedTracks })
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name })
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(track => track.uri)
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName: 'New Playlist Name',
        playlistTracks: []
      })
    })
  }

  search(term) {
    console.log(`Searching for '${term}'...'`)
    Spotify.search(term).then(searchResults => {
      this.setState({ searchResults: searchResults })
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist}/>
          </div>
        </div>
      </div>
    )
  }
}

export default App
