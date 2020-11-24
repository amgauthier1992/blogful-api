require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const validateBearerToken = require('./validate-bearer-token')
const errorHandler = require('./error-handler')
const usersRouter = require('./users/users-router')
const articlesRouter = require('./articles/articles-router')
const commentsRouter = require('./comments/comments-router')

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}))

app.use(cors());
app.use(helmet());
app.use(validateBearerToken)
app.use('/api/users', usersRouter)
app.use('/api/articles', articlesRouter)
app.use('/api/comments', commentsRouter)
app.use(errorHandler)

module.exports = app;
