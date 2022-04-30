const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({});

  response.json(notes);
});

notesRouter.get('/:id', async (request, response, next) => {
  const id = request.params.id;

  try {
    const foundNote = await Note.findById(id);

    if (foundNote) {
      response.json(foundNote);
    } else {
      response.statusMessage = `Note id#${id} not found`;
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

notesRouter.post('/', async (request, response, next) => {
  const noteInfo = request.body;

  if (!noteInfo.content) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const newNote = new Note({
    content: noteInfo.content,
    important: noteInfo.important || false,
    date: new Date(),
  });

  try {
    const savedNote = await newNote.save();
    response.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
});

notesRouter.delete('/:id', async (request, response, next) => {
  const id = request.params.id;

  try {
    await Note.findByIdAndRemove(id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

notesRouter.put('/:id', (request, response, next) => {
  const id = request.params.id;
  const { content, important } = request.body;

  Note.findByIdAndUpdate(
    id,
    { content, important },
    { new: true, runValidators: true, context:'query' }
  )
    .then(updatedNote => {
      response.json(updatedNote);
    })
    .catch(error => next(error));
});

module.exports = notesRouter;
