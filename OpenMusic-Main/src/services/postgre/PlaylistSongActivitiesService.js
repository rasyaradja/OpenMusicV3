const { Pool } = require('pg');

class PlaylistSongActivities {
  constructor() {
    this._pool = new Pool();
  }

  async getActivitesInPlaylist(id) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
        FROM playlist_song_activities
        LEFT JOIN users ON users.id = playlist_song_activities.user_id
        LEFT JOIN songs ON songs.id = playlist_song_activities.song_id 
        WHERE playlist_song_activities.playlist_id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}
module.exports = PlaylistSongActivities;
