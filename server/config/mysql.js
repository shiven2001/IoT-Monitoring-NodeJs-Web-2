const mysql = require('mysql');
const connection = mysql.createConnection({
 host: '127.0.0.1',
 port: 3306,
 user: 'root',
 password: 'waterland',
 database: 'Waterland_Monitoring'
});
connection.connect((err) => {
 if (err) {
 console.error('Error connecting to the database:', err);
 return;
 }
 console.log('Connected to the SQL database!');
});

module.exports = connection;