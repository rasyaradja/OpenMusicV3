const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;
    autoBind(this);
  }

  async postUploadCoverImageHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;
    if (!cover || !cover.hapi) {
      const response = h.response({
        status: 'fail',
        message: 'Invalid file upload payload',
      });
      response.code(400);
      return response;
    }
    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);

    const url = `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`;
    await this._albumsService.editCoverAlbumById(albumId, url);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      cover: {
        coverUrl: `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
