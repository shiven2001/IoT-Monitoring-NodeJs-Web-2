//FOR JSON ONLY
const dgram = require('dgram');
const connection = require('../config/mysql');
const udpServer = dgram.createSocket('udp4');

const IP_ADDRESS = '192.168.0.124'; // Replace with the desired IP address
const PORT = 12345; // Replace with the desired port number

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`UDP JSON server listening on ${address.address}:${address.port}`);
});

udpServer.on('message', (message, remote) => {
  console.log(`Received message from ${remote.address}:${remote.port}`);
  console.log(`Message: ${message}`);

  //FOR Dragino DDS75-NB sensors
  message = message.toString();
  const editedMessage = message.substring(0, 86) + "}";
  console.log(editedMessage);

  udpServer.on('error', (err) => {
    console.log(`UDP server error:\n${err.stack}`);
    udpServer.close();
  });

  try {
      const data = JSON.parse(editedMessage);
      const imei = data.IMEI;
      const model = data.Model;
      const distance = data.distance;
      const battery = parseFloat(data.battery);
      const xsignal = parseInt(data.signal);

      const checkQuery = `SELECT * FROM \`${imei}\``;

      connection.query(checkQuery, (error, results) => {
        if (error) {
          console.error('Table does not exist: ', error);

          const createTableQuery = `
            CREATE TABLE \`${imei}\` (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            IMEI VARCHAR(255) NULL,
            Model VARCHAR(255) NULL,
            distance INT NULL,
            battery DECIMAL(10,2) NULL,
            xsignal INT NULL,
            timestamp TIMESTAMP NULL
            )
          `;

          connection.query(createTableQuery, (error, results) => {
            if (error) {
              console.error('Error creating the table:', error);
            } else {
              console.log('Table created successfully');
            }
          });

        } else {
            console.log('Table already exist:');
            const insertQuery = `
              INSERT INTO \`${imei}\` (
                IMEI,
                Model,
                distance,
                battery,
                xsignal,
                timestamp
              ) VALUES (
                '${imei}',
                '${model}',
                ${distance},
                ${battery},
                ${xsignal},
                NOW()
              )
            `;
          connection.query(insertQuery, (error, results) => {
            if (error) {
              console.error('Error inserting data into the table:', error);
            } else {
              console.log('Data inserted successfully');
            }
          });
        }
      });
  } catch (error) {
    console.error('Error parsing or processing the received data:', error);
  }
});
      

udpServer.bind(PORT, IP_ADDRESS);