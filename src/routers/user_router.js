const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user_model');
// grab mongodb driver to use its ObjectID.isValid method
const mongodb = require('mongoose').mongo;
// validator also provides a method for validating ObjectIDs
// const validator = require('validator');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');
const router = new express.Router();


// create a user
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    // could go async here?
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }

  //old non-async code using .then promises
  // user.save().then(() => {
  //   // use status 201 'created'
  //   res.status(201).send(user);
  // }).catch((err) => {
  //   res.status(400).send(err);
  // });
});

// login a user
router.post('/users/login', async (req, res) => {
  try {
    // findByCredentials is a Model method define in the User model
    const user = await User.findByCredentials(req.body.email, req.body.password);
    // generateAuthToken is an instance method defined in the User model
    const token = await user.generateAuthToken();
    // getPublicProfile() strips undesired stuff from user before sending
    res.send({ user, token });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// logout current user session
router.post('/users/logout', auth, async (req, res) => {
  try {
    // filter OUT the current token from the user's tokens array
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500);
  }
});

// kill ALL sessions/delete ALL tokens
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500);
  }
});

router.get('/users/me', auth, async (req, res) => {
  // user object was attached to req in auth.js, don't need to get it again
  res.send(req.user);
});

// get all users
// Andrew got rid of get all users route for security, I'm going to leave it
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({});
    // throw new Error('make it break');
    res.send(users);

  } catch (e) {
    res.status(500).send(e);
  }

  // old non-async code
  // User.find({}).then((users) => {
  //   res.send(users);
  // }).catch((err) => {
  //   res.status(500).send('Server Error');
  // });
});

// get a user by id
router.get('/users/:id', async (req, res) => {
  const _id = (req.params.id);

  if (!mongodb.ObjectID.isValid(_id)) {
    return res.status(400).send('not a valid Mongo ID');
  }

  try {
    const user = await User.findById(_id);

    if (!user) {
      // sendStatus() both sets the status and sends string representation of status as body,
      // e.g., res.sendStatus(404) is equivalent to res.status(404).send('Not Found')  
      // return res.sendStatus(404);
      return res.status(404).send('ID not found');
    }
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }

  // old non-async code
  // can validate ObjectID using mongodb.ObjectID.isValid()
  // if (!mongodb.ObjectID.isValid(_id)) {
  //   return res.status(400).send('mongodb.ObjectID.isvalid() says "invalid Mongo ID"');
  // }
  // or using validator.isMongoId()
  // if (!validator.isMongoId(_id)) {
  //   return res.status(400).send('validator.IsMongoId() says "invalid Mongo ID"');
  // }

  // User.findById(_id).then((user) => {
  //   if (!user) {
  //     return res.status(404).send('ID not found');
  //   }
  //   res.send(user);
  // }).catch((err) => {
  //   res.status(500).send(err);
  // });
});

// // update a user by id becomes update own profile below
// router.patch('/users/:id', async (req, res) => {
//   console.log(req.body);
//   const incomingUpdates = Object.keys(req.body);
//   const allowedUpdates = ['name', 'email', 'password', 'age'];
//   const isValidOperation = incomingUpdates.every(update => allowedUpdates.includes(update));

//   if (!isValidOperation) {
//     return res.status(400).send({ error: 'Invalid Updates!' });
//   }

//   try {
//     // findByIdAndUpdate executes directly in the db, bypassing
//     // Mongoose middleware (query) and so does not trigger
//     // pre- and post- hooks from Mongoose Schema (User)
//     // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//     // Instead, use findById(), set attributes manually,
//     // and call save(), which DOES trigger Mongoose middleware
//     const user = await User.findById(req.params.id);
//     // console.log(user);

//     if (!user) {
//       return res.status(404).send();
//     }
//     // Use bracket notation to match and set attributes of user to incoming req.body attributes
//     incomingUpdates.forEach((update) => user[update] = req.body[update]);
//     // console.log(user);
//     await user.save();

//     res.send(user);
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

// update own profile
router.patch('/users/me', auth, async (req, res) => {
  // console.log(req.body);
  const incomingUpdates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = incomingUpdates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates!' });
  }

  try {
    // Use bracket notation to match and set attributes of user to incoming req.body attributes
    incomingUpdates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// // delete a user by ID becomes delete own profile below
// router.delete('/users/:id', async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);

//     if (!user) {
//       return res.status(404).send();
//     }

//     res.send(user);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

// delete own profile
router.delete('/users/me', auth, async (req, res) => {
  try {
    // req.user was provided by auth middleware
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    // I like 500 here because if it was an authenticaion error auth.js
    // would have already sent a 401, so it must be something else
    res.status(500).send(e);
  }
});

// Upload an avatar/file (also works for updating/changing avatar)
// Set up multer
const upload = multer({
  limits: {
    fileSize: 1000000, // 1 million bytes =  i.e., 1 megabyte
  },
  fileFilter(req, file, cb) { // Multer provides a file object, see docs for properties
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      // if extension doesn't match, call the cb with error and return
      return cb(new Error('Avatar must be a .jpg/.jpeg/.png'));
    }
    // if it does match set the error object to
    // undefined and boolean acceptFile to true
    cb(undefined, true);
  }
});
// Do the upload
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  // req.user.avatar = req.file.buffer;
  // use sharp to resize and convert image to png, put it back into a buffer again
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
  // Don't want ALL the html error output, so capture just
  // the error message from the Multer middeware and send that.
  // fileSize generates it's own error message?
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

// delete own avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.sendStatus(200);
  // are we really expecting an error?
  // try {
  //   req.user.avatar = undefined;
  //   await req.user.save();
  //   res.sendStatus200);
  // } catch (e) {
  //   res.sendStatus(500);
  // }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send('No avatar found for that user');
  }
});


module.exports = router;