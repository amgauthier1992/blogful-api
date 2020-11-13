require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const logger = require('./logger');
const { NODE_ENV } = require("./config");
const ArticlesService = require('./articles-service')

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization') 
  
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to the next middleware
  next()
})

//creating our GET endpoint that gets all articles from the db. Here we use the 
//ArticlesService.getAllArticles method inside the endpoint to populate the response
app.get("/articles", (req, res, next) => {
  //reading the db property that we set on the app object from server.js
  const knexInstance = req.app.get('db')
  //passing knexInstance as an argument to our service method. If you look at the service methods,
  //they all have parameters named knex, which represent the knexInstance.
  ArticlesService.getAllArticles(knexInstance)
    .then(articles => {
      res.json(articles)
    })
    //Note we're passing next into the .catch from the promise chain so that any 
    //errors get handled by our error handler middleware.
    .catch(next) 
});

app.get("/articles/:article_id", (req, res, next) => {
  // res.json({ "requested_id": req.params.article_id, this: "should fail" })
  const knexInstance = req.app.get('db')
  ArticlesService.getById(knexInstance, req.params.article_id)
    .then(article => {
      if(!article){
        return res.status(400).json({
          error: { message: `Article doesn't exist` }
        })
      }
      res.json(article)
    })
    .catch(next)
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
