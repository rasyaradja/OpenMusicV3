const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistsHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name = 'untitled' } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const playlistId = await this._service.addPlaylists({
        name,
        owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Playlists berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistsHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistSongsAccess(playlistId, credentialId);
    await this._service.deletePlaylistsById(playlistId);

    const response = h.response({
      status: 'success',
      message: 'Playlists berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
