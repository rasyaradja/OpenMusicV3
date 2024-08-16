const CollaborationsHandler = require('./handler');
const routes = require('./routes');
const UsersService = require('../../services/postgre/UsersService');

const usersService = new UsersService();

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (
    server,
    {
      collaborationsService, playlistsService, validator,
    },
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      usersService,
      validator,
    );
    server.route(routes(collaborationsHandler));
  },
};
