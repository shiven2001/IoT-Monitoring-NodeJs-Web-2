// FOR HEX ONLY
const dgram = require('dgram');
const connection = require('../config/mysql');
const udpServer = dgram.createSocket('udp4');

const IP_ADDRESS = '192.168.0.124'; // Replace with the desired IP address
const PORT = 12346; // Replace with the desired port number

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`UDP HEX server listening on ${address.address}:${address.port}`);
});

udpServer.on('message', (message, remote) => {
  console.log(`Received message from ${remote.address}:${remote.port}`);
  console.log(`Message: ${message}`);

  //FOR PRWRI ZJ.NLJC-01 sensors
  const buf = Buffer.from(message);
  const buffed_message = buf.toString('hex');
  console.log(`Buffered Message: ${buffed_message}`);

  function extractValues(hexMessage) {
    const decodedMessage = {};
    const segments = hexMessage.match(/.{2}/g);
    const decodingFormat = [
      { label: 'Device Name', start: 3, length: 5},
      { label: 'Water Depth', start: 39, length: 2 },
      { label: 'Water Level', start: 43, length: 2 },
      { label: 'Signal Value', start: 48, length: 1},
      { label: 'Voltage', start: 51, length: 2 }
    ];
    for (const format of decodingFormat) {
      const segment = segments.slice(format.start, format.start + format.length);
      decodedMessage[format.label] = segment.join('');
    }
    return decodedMessage;
  }
  
  const hexMessage = buffed_message;
  const extractedValues = extractValues(hexMessage);

  udpServer.on('error', (err) => {
    console.log(`UDP server error:\n${err.stack}`);
    udpServer.close();
  });

  try {
      const deviceName = extractedValues['Device Name'];
      const deviceType = 'ZJ.NLJC-01';
      const waterDepth = extractedValues['Water Depth'];
      const waterLevel = extractedValues['Water Level'];
      const signalValue = extractedValues['Signal Value'];
      const voltage = extractedValues['Voltage'];
      
      const checkQuery = `SELECT * FROM \`${deviceName}\``;

      connection.query(checkQuery, (error, results) => {
        if (error) {
          console.error('Table does not exist: ', error);

          const createTableQuery = `
            CREATE TABLE \`${deviceName}\` (
              id INT AUTO_INCREMENT PRIMARY KEY,
              device_name VARCHAR(255) NULL,
              device_type VARCHAR(255) NULL,
              water_depth INT NULL,
              water_level INT NULL,
              signal_value INT NULL,
              voltage INT NULL,
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
              INSERT INTO \`${deviceName}\` (
                device_name,
                device_type,
                water_depth,
                water_level,
                signal_value,
                voltage,
                timestamp
              ) VALUES (
                '${deviceName}',
                '${deviceType}',
                ${waterDepth},
                ${waterLevel},
                ${signalValue},
                ${voltage},
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