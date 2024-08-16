exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    year: {
      type: 'INT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
