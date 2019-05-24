const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user_model');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');
const jwt = require('jsonwebtoken');

// setupDatabase is async so that it always finishes before test runs
beforeEach(setupDatabase);

test('Should sign up a new TEST user', async () => {
  const response = await request(app).post('/users').send({
    name: 'Pinky',
    email: 'peter.yellman@webformation.com',
    password: 'pinky1234!'
  }).expect(201);

  // assertion about the database
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // assertions about the response
  // this one will only check a single property/value
  expect(response.body.user.name).toBe('Pinky');
  // or, use toMatchObject to see response _contains_ a certain prop/value
  expect(response.body).toMatchObject({
    user: {
      name: 'Pinky',
      email: 'peter.yellman@webformation.com'
    },
    token: user.tokens[0].token
  });
  // make sure that the password was not stored as plain text
  expect(user.password).not.toBe('pinky1234!');
});

// test('Should not signup user with invalid name/email/password', async () => {
//   const response = await request(app).post('/users').send({
//     // modify or comment out any of the below
//     // e.g. an invalid email or password < 7 chars
//     // name: 'Peter Yellman',
//     email: 'peter.yellman@webformation.com',
//     password: 'peter1234!'
//   }).expect(400);
// });

// test('Should login existing user', async () => {
//   const response = await request(app).post('/users/login').send({
//     email: userOne.email,
//     password: userOne.password
//   }).expect(200);

//   // use Id from userOne this time to compare to token in response
//   const user = await User.findById(userOneId);
//   expect(response.body.token).toBe(user.tokens[1].token);
// });

// test('Should fail to login with bad credentials', async () => {
//   await request(app).post('/users/login').send({
//     email: 'idontexist@webformation.com',
//     password: 'dont1234!'
//   }).expect(400);
// });

// test('Should get user profile', async () => {
//   await request(app)
//     .get('/users/me')
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .send()
//     .expect(200);
// });

// test('Should fail to get user profile for unauthenticated user', async () => {
//   await request(app)
//     .get('/users/me')
//     .set('Authorization', 'nonsense')
//     .send()
//     .expect(401);
// });

// test('Should delete account for authenticated user', async () => {
//   await request(app)
//     .delete('/users/me')
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .send()
//     .expect(200);

//   const user = await User.findById(userOneId);
//   expect(user).toBeNull();
// });

// test('Should not delete account for not authenticated user', async () => {
//   await request(app)
//     .delete('/users/me')
//     // not setting anything would be fine too
//     .set('Authorization', 'Sneaky Pete')
//     .send()
//     // this 401 comes from auth.js
//     .expect(401);
// });

// test('Should upload avatar image', async () => {
//   await request(app)
//     .post('/users/me/avatar')
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     // supertest provides attach() method for files
//     .attach('avatar', 'tests/fixtures/tux.png')
//     .expect(200);

//   const user = await User.findById(userOneId);
//   // use toEqual here, which uses ==, instead of toBe which
//   // uses  === and the objects are not the same object
//   // here, just see if avatar is a any kind of  Buffer
//   expect(user.avatar).toEqual(expect.any(Buffer));
// });

// test('Should update user name', async () => {
//   await request(app)
//     .patch('/users/me')
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .send({
//       name: 'Taco'
//     })
//     .expect(200);

//   const user = await User.findById(userOneId);
//   expect(user.name).toEqual('Taco');
// });

test('Should not allow updates with invalid or no token', async () => {
  const falsetoken = jwt.sign({ _id: userOneId }, 'nottherealsecret');
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${falsetoken}`)
    .send({
      name: 'Taco'
    })
    .expect(401);
});

// test('Should not allow updates to user profile that violate validator', async () => {
//   await request(app)
//     .patch('/users/me')
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .send({
//       name: 'Comment me out',
//       email: 'notavalidemail',
//       password: 'toshrt'
//     })
//     .expect(400);
// });

// test('Should not update an invalid field(s)', async () => {
//   await request(app)
//     .patch('/users/me')
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .send({
//       location: 'Earlysville'
//     })
//     .expect(400);
// });
