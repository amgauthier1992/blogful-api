//Create a new file for the router named comments-router.js. A comment 
//requires the text field and a date, but the date_commented has a default 
//value so if it is not provided it will be set to the current system date 
//and time. The article_id and user_id are also required. When updating a 
//comment only the text and date are allowed to be updated. That is, we are 
//not going to allow switching the article for a comment or the user.

const path = require('path')
const express = require('express')
const xss = require('xss')
const CommentsService = require('./comments-service')

const commentsRouter = express.Router()
const bodyParser = express.json()

const serializeComment = comment => ({
  id: comment.id,
  text: xss(comment.text),
  date_commented: comment.date_commented,
  article_id: comment.article_id,
  user_id: comment.user_id
})

commentsRouter
  .route('/')
  .get((req,res,next) => {
    const knexInstance = req.app.get('db')
    CommentsService.getAllComments(knexInstance)
      .then(comments => {
        res.json(comments.map(serializeComment))
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { text, article_id, user_id, date_commented } = req.body
    const newComment = { text, article_id, user_id }

    for (const [key, value] of Object.entries(newComment))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    
    newComment.date_commented = date_commented;

    CommentsService.insertComment(knexInstance, newComment)
      .then(comment => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${comment.id}`))
          .json(serializeComment(comment))
      })
      .catch(next)
  })

commentsRouter
  .route('/:comment_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db')
    const comment_id = req.params.comment_id
    CommentsService.getById(knexInstance, comment_id)
      .then(comment => {
        if(!comment){
          return res.status(400).json({
            error: { message: `Comment doesn't exist`}
          })
        }
        res.comment = comment
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeComment(res.comment))
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db')
    const comment_id = req.params.comment_id
    CommentsService.deleteComment(knexInstance, comment_id)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const comment_id = req.params.comment_id
    const { text, date_commented } = req.body
    const commentToUpdate = { text, date_commented }

    const numberOfValues = Object.values(commentToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'text' or 'date_commented'`
        }
      })
    
    CommentsService.updateComment(knexInstance, comment_id, commentToUpdate)
      .then(updatedComment => {
        res.status(200).send(updatedComment)
      })
      .catch(next)
  })

module.exports = commentsRouter