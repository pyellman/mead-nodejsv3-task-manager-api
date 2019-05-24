// V3 of tutorial split server.js into app.js and index.js;
// allows us to run tests against app.js without calling server listen()

const app = require('./app');
// get env from /config/env.*
const port = process.env.PORT;

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});