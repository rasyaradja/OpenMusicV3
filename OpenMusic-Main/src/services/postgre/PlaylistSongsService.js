const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const checkQuery = {
      text: 'SELECT id FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      throw new InvariantError('Lagu sudah ada di dalam playlist');
    }

    const id = `playlist-songs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan kedalam playlist');
    }

    return result.rows[0].id;
  }

  async getSongInPlaylist(id) {
    let query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
			LEFT JOIN users ON users.id = playlists.owner
			WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlists = result.rows[0];

    query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs
			LEFT JOIN songs ON songs.id = playlist_songs.song_id
			WHERE playlist_songs.playlist_id = $1`,
      values: [id],
    };
    const resultSong = await this._pool.query(query);
    if (!resultSong.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    const songs = resultSong.rows;
    const response = {
      ...playlists,
      songs,
    };
    return response;
  }

  async deleteSongInPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal menghapus lagu dari playlist, id tidak ditemukan',
      );
    }
  }

  async addToActivity({
    playlistId, songId, credentialId, action, time,
  }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, credentialId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }

    return result.rows[0].id;
  }
}

module.exports = PlaylistSongsService;
