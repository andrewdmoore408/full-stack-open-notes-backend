/* global describe beforeEach afterAll test expect */

const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');
const User = require('../models/user');

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'testaccount',
      name: 'Big Bird',
      password: '123 Sesame St',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  }, 10000);

  test('creation fails with proper status code and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const usernameTaken = {
      username: 'root',
      name: 'Superuser',
      password: 'rootpassword',
    };

    const result = await api
      .post('/api/users')
      .send(usernameTaken)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('username must be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  }, 10000);
});
