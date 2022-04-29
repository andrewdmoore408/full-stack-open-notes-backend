require('dotenv').config();
const express = require('express');
require('mongoose');
const Note = require('./models/note');


const app = express();

const cors = require('cors');

app.use(express.static('build'));
app.use(express.json());
app.use(requestLogger);
app.use(cors());

function requestLogger(request, response, next) {
  console.log('Method: ', request.method);
  console.log('Path:   ', request.path);
  console.log('Body:   ', request.body);
  console.log('---');
  next();
}

app.get('/', (request, response) => {
  response.send('<h1>Hello, world!</h1>');
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id;

  Note.findById(id)
    .then(note => {
      if (note) {
        response.json(note);
      } else {
        response.statusMessage = `Note id#${id} not found`;
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id;

  Note.findByIdAndRemove(id)
  // eslint-disable-next-line no-unused-vars
    .then(_ => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

app.post('/api/notes', (request, response, next) => {
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

  newNote.save()
    .then(savedNote => {
      response.json(savedNote);
    })
    .catch(error => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

function errorHandler(error, request, response, next) {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
}

app.use(errorHandler);

// eslint-disable-next-line no-undef
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
