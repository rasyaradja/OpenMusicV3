const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const albums = request.payload;

    const albumId = await this._service.addAlbum(albums);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbaharui',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async postLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);

    const liked = await this._service.checkLikeAlbum(userId, albumId);

    if (!liked) {
      await this._service.addLikeAlbum(userId, albumId);
    } else {
      // Bad Request!
      const response = h.response({
        status: 'fail',
        message: 'Maaf, hanya bisa menyukai album 1 kali saja.',
      });
      response.code(400);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album.',
    });

    response.code(201);
    return response;
  }

  async getLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;

    const { source, likeCounts: likes } = await this._service.getAlbumLikesById(
      albumId,
    );

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', source);
    response.code(200);
    return response;
  }

  async deleteLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteLikeAlbum(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Unlike album',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
