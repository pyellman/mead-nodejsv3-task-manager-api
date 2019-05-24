const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task_model');

// must explicity create a Schema to use Schema options such as timestamp
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be greater than zero');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"');
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  }
},
  {
    // timestamps defaults to false
    timestamps: true,
  });

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
});

// Instance method on instances of User, i.e., user
// to strip down what user information is sent back.
// We need access to 'this', so cannot use arrow function.
// ? Overrides Mongoose toJSON() on user doc instances;
// Express invokes JSON.stringify() before res.send(),
// JSON.stringify() invokes toJSON()
userSchema.methods.toJSON = function () {
  const user = this;
  // Mongoose toObject() method
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

// Instance method on instances of User, i.e., user
// We need access to 'this', so cannot use arrow function
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  // alt: create a token with expiration, expiresIn syntax uses https://www.npmjs.com/package/ms; other options also available
  // const token = jwt.sign({ _id: user._id.toString() }, 'randomalphachars', { expiresIn: '1 hour' });

  user.tokens = user.tokens.concat({ token });
  // alt using push
  // user.tokens.push({ token });
  // alt using spread operator
  // user.tokens = [...user.tokens, { token }];
  await user.save();

  return token;
};

// Model method on User schema
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to log in');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to log in');
  }

  return user;
};

// use Mongoose pre- middleware hook to hash
// the plain text password before saving
userSchema.pre('save', async function (next) {

  // console.log('Console: userSchema.pre save hook triggered');
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  // gotta call next() -- unless using Mongoose 5.x!!
  next();
});

// Delete user's task when user is removed
userSchema.pre('remove', async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});


const User = mongoose.model('User', userSchema);

module.exports = User; 