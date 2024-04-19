const mongoose = require('mongoose');

// First database connection
const db1 = mongoose.createConnection(process.env.MONGODB_URI1, {
});

db1.on('error', console.error.bind(console, 'Connection error:'));
db1.once('open', () => {
  console.log('Connected to DB1');
});

module.exports = db1;