const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationsError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylists({ name, owner }) {
    const id = `playlists-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlists gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const queryPlaylists = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
		LEFT JOIN users ON users.id = playlists.owner 
		LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id 
		WHERE playlists.owner = $1 OR collaborations.user_id = $1;`,
      values: [owner],
    };
    const result = await this._pool.query(queryPlaylists);
    return result.rows;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlists = result.rows[0];
    if (playlists.owner !== userId) {
      throw new AuthorizationError(
        'Anda tidak memiliki akses ke playlist ini',
      );
    }
  }

  async verifyPlaylistSongsAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(
          playlistId,
          userId,
        );
      } catch {
        throw error;
      }
    }
  }

  async deletePlaylistsById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
