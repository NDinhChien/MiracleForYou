function seed(dbName, user, password) {
  db = db.getSiblingDB(dbName);
  db.createUser({
    user: user,
    pwd: password,
    roles: [{ role: 'readWrite', db: dbName }],
  });

  db.createCollection('roles');

  db.roles.insertMany([
    {
      code: 'LEARNER',
      status: true,
      createdAt: new Date(),
    },
    {
      code: 'ADMIN',
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  db.createCollection('users');
  db.users.insertOne({
    email: 'yourname@gmail.com',
    password: '$2b$10$Mle7PcoUqcnwfxCBF3fD3eE53vuodkqujKegPO0H3diKSSCdHPScy', // bcrypt.hash('12345678', 10)
    name: 'admin',
    nameUpdatedAt: new Date(),
    roles: db.roles
      .find({})
      .toArray()
      .map((role) => role._id),
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

seed('maindb', 'yourname', '12345678');
seed('testdb', 'testuser', '12345678');
