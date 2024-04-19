const mongoose = require('mongoose');

// Second database connection
const db2 = mongoose.createConnection(process.env.MONGODB_URI2, {
});

db2.on('error', console.error.bind(console, 'Connection error:'));
db2.once('open', () => {
  console.log('Connected to DB2');
});

module.exports = db2;