const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/user');
const trainDataRoutes = require('./routes/trainData');
const modelRoutes = require('./routes/models');
const config = require('./config/config');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


if(process.env.NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('combined'));
}

require('./passport');

app.use('/user', userRoutes);
app.use('/trainData', trainDataRoutes);
app.use('/model', modelRoutes);

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/public/'));
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}
mongoose.set('useCreateIndex', true);

mongoose.connect(config.dbPath, {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to the database...'))
  .catch((err) => console.error('Could not connect to the database...', err));

app.listen(config.port);
console.log(`App started on port ${config.port}`);
