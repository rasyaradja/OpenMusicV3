exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(12)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    duration: {
      type: 'INT',
      notNull: false,
    },
    albumId: {
      type: 'VARCHAR(30)',
      notNull: false,
    },
  });

  pgm.addConstraint('songs', 'fk_songs.albumId_albums.id', {
    foreignKeys: {
      columns: 'albumId',
      references: 'albums(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
  pgm.dropConstraint('songs', 'fk_songs.albumId_albums.id');
};
