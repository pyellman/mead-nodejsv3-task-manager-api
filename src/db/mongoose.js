const mongoose = require('mongoose');

// mongoose.connect('mongodb://pyellman:ebosmongo640@ds143573.mlab.com:43573/my_local_library',
mongoose.connect(process.env.MONGODB_URL,
  //set various options to get rid of deprecation warnings
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
);