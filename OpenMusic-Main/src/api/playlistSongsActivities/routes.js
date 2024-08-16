const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request, h) => handler.getActivitiesInPlaylistHandler(request, h),
    options: {
      auth: 'musicapp_jwt',
    },
  },
];

module.exports = routes;
