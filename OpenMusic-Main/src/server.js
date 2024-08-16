require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgre/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/postgre/SongsService');
const SongsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/postgre/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgre/AuthenticationsService');
const TokenManager = require('./token/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgre/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// playlistSongs
const playlistSongs = require('./api/playlistSongs');
const PlaylistSongsService = require('./services/postgre/PlaylistSongsService');
const PlaylistSongsValidator = require('./validator/playlistSongs');

// playlist-song-activities
const playlistSongActivities = require('./api/playlistSongsActivities');
const PlaylistSongActivitiesService = require('./services/postgre/PlaylistSongActivitiesService');
const PlaylistSongActivitiesValidator = require('./validator/playlistSongActivities');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgre/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/redis/CacheService');

// client error
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService(cacheService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService(
    collaborationsService,
  );
  const playlistSongActivitiesService = new PlaylistSongActivitiesService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/uploads/file/images'),
  );

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('musicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        service: playlistSongsService,
        validator: PlaylistSongsValidator,
      },
    },
    {
      plugin: playlistSongActivities,
      options: {
        service: playlistSongActivitiesService,
        validator: PlaylistSongActivitiesValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
