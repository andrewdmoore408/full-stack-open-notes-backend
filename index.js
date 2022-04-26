require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
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

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2022-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2022-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2022-05-30T19:20:14.298Z",
    important: true
  },
];

const generateID = () => {
  if (notes.length > 0) {
    return (Math.max(...notes.map(note => note.id))) + 1;
  } else {
    return 0;
  }
};

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
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));

  // const noteToDelete = notes.find(note => note.id === id);

  // if (noteToDelete) {
  //   notes = notes.filter(note => note.id !== id);
  //   response.status(204).end();
  // } else {
  //   response.statusMessage = `Note id#${id} not found`;
  //   response.status(404).end();
  // }
});

app.post('/api/notes', (request, response) => {
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

  newNote.save().then(savedNote => {
    response.json(savedNote);
  });
});

const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

function errorHandler(error, request, response, next) {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' });
  }

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
