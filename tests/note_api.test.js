/* global beforeEach afterAll test expect */

const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const Note = require('../models/note');

beforeEach(async () => {
  await Note.deleteMany({});
  console.log('cleared');

  const noteObjects = helper.initialNotes
    .map(note => new Note(note));

  const promiseArray = noteObjects.map(note => note.save());
  await Promise.all(promiseArray);
});

afterAll(() => {
  mongoose.connection.close();
});

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 10000);

test('all notes are returned', async () => {
  const response = await api.get('/api/notes');

  expect(response.body).toHaveLength(helper.initialNotes.length);
}, 10000);

test('a specific note is within the required notes', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map(r => r.content);
  expect(contents).toContain(
    'Browser can execute only Javascript'
  );
}, 10000);

test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const processedNoteToView = JSON.parse(JSON.stringify(noteToView));
  expect(resultNote.body).toEqual(processedNoteToView);
});

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204);

  const notesAtEnd = await helper.notesInDb();
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

  const contents = notesAtEnd.map(r => r.content);
  expect(contents).not.toContain(noteToDelete.content);
});

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

  const contents = notesAtEnd.map(r => r.content);
  expect(contents).toContain('async/await simplifies making async calls');
}, 10000);

test('note without content is not created', async () => {
  const faultyNote = {
    content: '',
    important: false,
  };

  await api
    .post('/api/notes')
    .send(faultyNote)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
}, 10000);
