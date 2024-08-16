const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { AlbumMapToModel, SongMapToModel } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id ',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(AlbumMapToModel);
  }

  async getAlbumById(id) {
    let query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const resultAlbums = await this._pool.query(query);

    if (!resultAlbums.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    const albums = resultAlbums.rows.map(AlbumMapToModel)[0];

    query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const resultSongs = await this._pool.query(query);
    const songs = resultSongs.rows.map(SongMapToModel);
    const response = {
      ...albums,
      songs,
    };

    return response;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $2, year = $3 WHERE id = $1 RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui Album. Id tidak ditemukan');
    }
  }

  async editCoverAlbumById(albumId, url) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2',
      values: [url, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui Cover Album. Id tidak ditemukan',
      );
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id tidak ditemukan');
    }
  }

  async checkLikeAlbum(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return false;
    }

    return true;
  }

  async addLikeAlbum(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan');
    }
    await this._cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async getAlbumLikesById(id) {
    try {
      const source = 'cache';
      const likeCounts = await this._cacheService.get(`likes:${id}`);
      return { source, likeCounts: +likeCounts };
    } catch (error) {
      await this.getAlbumById(id);

      const source = 'server';
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);
      const likeCounts = result.rowCount;

      await this._cacheService.set(`likes:${id}`, likeCounts);

      return { source, likeCounts };
    }
  }

  async deleteLikeAlbum(id, userId) {
    await this.getAlbumById(id);
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Id tidak ditemukan!');
    }
    await this._cacheService.delete(`likes:${id}`);
  }
}

module.exports = AlbumsService;
