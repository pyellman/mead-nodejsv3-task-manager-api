const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const auth = async (req, res, next) => {
  // console.log('auth middleware triggered');
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // in User Model we put the user's MongoID in the JWT payload section
    // also search the users's tokens array for a token with provided token
    // value; must quote as a string because of the . in the search criteria
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
    if (!user) {
      throw new Error();
    }
    // tack on the user object and token to the request
    // object to pass on to the request handler
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

module.exports = auth;