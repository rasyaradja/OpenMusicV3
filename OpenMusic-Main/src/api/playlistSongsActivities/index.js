const PlaylistSongActivitiesHandler = require('./handler');
const routes = require('./routes');
const PlaylistsService = require('../../services/postgre/PlaylistsService');

const playlistsService = new PlaylistsService();

module.exports = {
  name: 'playlist_song_activities',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(
      service,
      playlistsService,
      validator,
    );
    server.route(routes(playlistSongActivitiesHandler));
  },
};
