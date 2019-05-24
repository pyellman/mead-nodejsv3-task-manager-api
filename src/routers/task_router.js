const express = require('express');
const Task = require('../models/task_model');
const auth = require('../middleware/auth');
// grab mongodb driver to use its ObjectID.isValid method
const mongodb = require('mongoose').mongo;
// validator also provides a method for validating ObjectIDs
// const validator = require('validator');
const router = new express.Router();


// create a task
router.post('/tasks', auth, async (req, res) => {
  // console.log(req.ip);
  // const task = new Task(req.body);
  const task = new Task({
    // use spread operator to populate
    // corresponding attributes of Task object
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// GET a user's tasks and apply query params for limiting
// to incomplete tasks, pagination and skip, and sorting 
// GET /tasks?completed=true
// GET /tasks?limit=X&skip=Y
// GET /tasks?sortBy=createdAt_asc/desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    // if req.query.completed string is 'true', set match.completed to boolean true, else set to false
    match.completed = req.query.completed === 'true';
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    // 1 sorts ascending, -1 sorts descending
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    console.log('Ive been sorted', JSON.stringify(sort));
  }

  try {
    // alt way: find tasks by req.user._id
    // const tasks = await Task.find({ owner: req.user._id });
    // res.send(tasks);
    // or, use populate
    await req.user.populate({
      path: 'tasks',
      // could use ES6 shorthand (i.e, just match)
      match: match,
      options: {
        // Mongoose/mongo will only apply limit/skip
        // if parseInt returns a number
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort: sort
      }
    }).execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

// get a task by id
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = (req.params.id);
  // console.log('task id is: ', _id);

  if (!mongodb.ObjectID.isValid(_id)) {
    return res.status(400).send('not a valid Mongo ID');
  }

  try {
    // const task = await Task.findById(_id);
    // Need to also limit by owner, so switch to findOne()
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send('Task not found');
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

// update a task
router.patch('/tasks/:id', auth, async (req, res) => {
  const incomingUpdates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = incomingUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid Updates!' });
  }

  try {
    // dep: const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    // To also limit by owner, must switch to findOne()
    // add other logic, and then save()
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if (!task) {
      return res.status(404).send('task not found');
    }
    // Use bracket notation to match and set attributes of user to incoming req.body attributes
    incomingUpdates.forEach((update) => task[update] = req.body[update]);
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
  // try {
  // can't use findByIdAndDelete anymore now that
  // only the authenticated user's tasks are populated
  // const task = await Task.findByIdAndDelete(req.params.id);
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!task) {
    return res.status(404).send('Task not found');
  }

  res.send(task);
  // } catch (e) {
  //   res.status(500).send(e);
  // }
});


module.exports = router;