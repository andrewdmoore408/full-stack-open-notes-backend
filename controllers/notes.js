const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');

notesRouter.get('/', async (request, response) => {
  const allNotes = await Note
    .find({})
    .populate('user', { username: 1, name: 1 });

  response.json(allNotes);
});

notesRouter.get('/:id', async (request, response) => {
  const id = request.params.id;

  const foundNote = await Note.findById(id);

  if (foundNote) {
    response.json(foundNote);
  } else {
    response.statusMessage = `Note id#${id} not found`;
    response.status(404).end();
  }
});

notesRouter.post('/', async (request, response,) => {
  const noteInfo = request.body;
  const user = await User.findById(noteInfo.userId);

  if (!noteInfo.content) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const newNote = new Note({
    content: noteInfo.content,
    important: noteInfo.important || false,
    date: new Date(),
    user: user._id,
  });

  const savedNote = await newNote.save();
  user.notes = await user.notes.concat(savedNote._id);
  await user.save();

  response.status(201).json(savedNote);
});

notesRouter.delete('/:id', async (request, response) => {
  const id = request.params.id;

  await Note.findByIdAndRemove(id);
  response.status(204).end();
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
