const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: (request, h) => handler.postAlbumHandler(request, h),
  },
  {
    method: 'GET',
    path: '/albums',
    handler: () => handler.getAlbumsHandler(),
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: (request, h) => handler.getAlbumByIdHandler(request, h),
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: (request, h) => handler.putAlbumByIdHandler(request, h),
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.postLikeAlbumHandler(request, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getLikeAlbumHandler(request, h),
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.deleteLikeAlbumHandler(request, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
];

module.exports = routes;
