const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log('connecting to ', url);

mongoose.connect(url)
  .then(_ => {
    console.log('connected to DB');
  })
  .catch(error => {
    console.log('error connecting to MongoDB: ', error.message);
  });

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
});

noteSchema.set('toJSON', {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString(),
    delete returnedObj._id;
    delete returnedObj.__v;
  }
});

module.exports = mongoose.model('Note', noteSchema);
