/* global process */
const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Your MongoDB password is required: \'node mongo.js <password>\'');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://andrewdmoore84:${password}@fsomongo.c5ioy.mongodb.net/noteApp?retryWrites=true&w=majority`;

mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
});

const Note = mongoose.model('Note', noteSchema);

Note.find({ important: false }).then(result => {
  result.forEach(note => {
    console.log(note);
  });

  mongoose.connection.close();
});

// const notes = [];

// notes.push(new Note({
//   content: 'CSS is tedious',
//   date: new Date(),
//   important: true,
// }));

// notes.push(new Note({
//   content: 'JS is challenging and fun',
//   date: new Date(),
//   important: true,
// }));

// notes.push(new Note({
//   content: 'Full stack is great for both web dev and pancakes',
//   date: new Date(),
//   important: true,
// }));

// const promises = [];

// notes.forEach(note => {
//   promises.push(note.save());
// });

// Promise.allSettled(promises).then((_) => {
//   console.log('notes saved!');
//   mongoose.connection.close();
// });

// note.save().then(result => {
//   console.log('note saved!');
//   mongoose.connection.close();
// });
