const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;
    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(
      playlistId,
      credentialId,
    );

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    await this._service.sendMessage(
      'export:playlist',
      JSON.stringify(message),
    );
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang dalam proses!',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
