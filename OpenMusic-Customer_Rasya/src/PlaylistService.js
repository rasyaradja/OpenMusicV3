const { Pool } = require('pg');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistService(playlistId) {
    let query = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    const playlist = result.rows[0];

    query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
      LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };
    const resultSong = await this._pool.query(query);
    const songs = resultSong.rows;
    const response = {
      ...playlist,
      songs,
    };
    return response;
  }
}
module.exports = PlaylistService;
