const express = require('express');
const connection = require('../config/mysql');

const query = 'SELECT alerted_users FROM projects';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      connection.end();
      return;
    }

    // Extract email addresses from the alerted_users column
    const emailAddresses = results.map(row => row.alerted_users).join(',').split(',');

    // Send an email to each extracted email address
    emailAddresses.forEach(email => {
      sendEmail(email, 'Hello', 'This is a test email!');
    });

    connection.end();
  });

// Function to send an email using nodemailer
async function sendEmail(to, subject, body) {
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'your_email_service_provider',
    auth: {
      user: 'your_email',
      pass: 'your_password'
    }
  });

  // Configure the email options
  const mailOptions = {
    from: 'shiven@waterland.com.hk',
    to: to,
    subject: subject,
    text: body
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error(`Failed to send email to: ${to}`);
    console.error(error);
  }
}