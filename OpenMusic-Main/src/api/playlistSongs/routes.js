const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postSongToPlaylistHandler(request, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.getSongOnPlaylistHandler(request, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.deleteSongOnPlaylistHandler(request, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
];

module.exports = routes;
