// V3 of tutorial split server.js into app.js and index.js;
// allows us to run tests against app.js without calling server listen()

const express = require('express');
// not importing anything from ./db/mongoose, just running it
require('./db/mongoose');
const userRouter = require('./routers/user_router');
const taskRouter = require('./routers/task_router');
// const listEndpoints = require('express-list-endpoints');

const app = express();

// in v2 had to import and use bodyParser for parsing json, express re-added it as dependency as of 4.16
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
// could remove x-powered-by header, among others
// app.set('x-powered-by', false);

// list all endpoints on startup
// console.log(listEndpoints(app));

module.exports = app;


// Multer example to upload a file
// const multer = require('multer');
// const upload = multer({
//   dest: 'images',
//   limits: {
//     fileSize: 1000000 // 1 million bytes = 1 megabyte
//   },
//   fileFilter(req, file, cb) { // Multer provides file object, see docs for properties
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       // if extension doesn't match, call cb with error
//       return cb(new Error('File must be a doc or docx'));
//     }
//     // if it's OK, set the error object to undefined,
//     // and boolean acceptFile to true
//     cb(undefined, true);
//   }
// });
// app.post('/upload', upload.single('uploadedfile'), (req, res, next) => {
//   console.log('uploaded!');
//   res.send();
//   // capture the error from the middeware and package it up for the user
//   // fileSize generates it's own error message?
// }, (error, req, res, next) => {
//   res.status(400).send({ error: error.message });
// });


// example of app.use, applies to all requests, should come before routes
// app.use((req, res, next) => {
//   if (req.method === 'GET') {
//     res.send('GET not allowed');
//   } else {
//     next();
//   }
//   const maintenance = false;
//   if (maintenance) {
//     res.status(503).send('Site is down for maintenance');
//   } else {
//     next();
//   }
// });


// bcrypt example
// const bcrypt = require('bcryptjs');
// const bcryptExample = async () => {
//   const password = 'Red12345!';
//   const hashedPassword = await bcrypt.hash(password, 8);

//   console.log(password);
//   console.log(hashedPassword);

//   const isMatch = await bcrypt.compare('red12345!', hashedPassword);
//   if (isMatch) {
//     console.log('Its a match!');
//   } else {
//     console.log('Not a match!');
//   }
//   console.log(isMatch);
// };
// bcryptExample();

// using JWT example
// const jwt = require('jsonwebtoken');
// const jwtExample = async () => {
//   const token = jwt.sign({ _id: 'abc123' }, 'randomstringofchars', { expiresIn: '1 hour' });
//   console.log('token', token);
//   const verified = jwt.verify(token, 'randomstringofchars');
//   console.log(verified);
// };
// jwtExample();


// Mongoose populate() examples
// const Task = require('./models/task_model');
// const User = require('./models/user_model');

// const testPopulate = async () => {
//   // const task = await Task.findById('5c96e6db3f206f5e982e41b2');
//   // await task.populate('owner').execPopulate();
//   // console.log(task.owner);

//   const user = await User.findById('5c96e5c1cde8850e28332bca');
//   await user.populate('tasks').execPopulate();
//   console.log('Taco\'s tasks: ', user.tasks);
// };
// testPopulate();