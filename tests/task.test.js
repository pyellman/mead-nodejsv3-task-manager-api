const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task_model');
const { userOneId, userOne, userTwo, setupDatabase, taskOne } = require('./fixtures/db');

// setupDatabase is async so that it always finishes before test runs
beforeEach(setupDatabase);

test('Should create a task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Open a can of tuna'
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
  // could check other things here
});

test('Should get all tasks for user one', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // response is an array, check its length
  expect(response.body.length).toEqual(2);
});

test('Should not allow userTwo to delete taskOne belonging to userOne', async () => {
  response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
