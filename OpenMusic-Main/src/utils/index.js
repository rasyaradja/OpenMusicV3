const AlbumMapToModel = ({
  id,
  name,
  year,
  coverUrl,
}) => ({
  id,
  name,
  year,
  coverUrl,
});

const SongMapToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

const UserMapToModel = ({
  id, username, password, fullname,
}) => ({
  id,
  username,
  password,
  fullname,
});

module.exports = { AlbumMapToModel, SongMapToModel, UserMapToModel };
