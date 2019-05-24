const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  // send is async, but not using that here
  sgMail.send({
    to: email,
    from: 'peter.yellman@webformation.com',
    subject: 'Welcome to the App',
    text: `Wecome to our site ${name}`
  });
};

const sendCancellationEmail = (email, name) => {
  // send is async, but not using that here
  sgMail.send({
    to: email,
    from: 'peter.yellman@webformation.com',
    subject: 'Please don\'t leave!',
    text: `We're really going to miss you ${name}! Come back any time!`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
};