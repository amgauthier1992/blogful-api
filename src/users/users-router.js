const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const bodyParser = express.json()

//accepts a user object and uses xss middleware to scrub
//the required fields to remove potentially malicious embedded scripts
const serializeUser = user => ({ 
  id: user.id,
  fullname: xss(user.fullname),
  username: xss(user.username),
  nickname: xss(user.nickname),
  date_created: user.date_created
})

usersRouter
  .route('/') 
  .get((req,res,next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance) //calling our getAllUsers S/O method
      .then(users => { //when we get our users array back from the db query
        res.json(users.map(serializeUser)) //we then return our response in json format
        //but we also map through our users and for each user, we scrub the values
        //of each key above using our serialize method. The end result is an
        //array of objects in json format.
      })
      .catch(next)
  })
  .post(bodyParser, (req,res,next) => {
    const knexInstance = req.app.get('db')
    const { fullname, username, nickname, password } = req.body //these are all the possible fields that
    //can be received from the client request body
    const newUser = { fullname, username } //these are the required fields(?)

    //validating that the required keys fullname and username exist
    //in the request body. If they dont, send an error message
    for (const [key, value] of Object.entries(newUser)) {
        if (value == null) {
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })
        }
      } 
    
    //after we validate the above required fields, we need to assign/append
    //the optional values of nickname and password that may have been
    //sent in the req body as well. We use dot notation to append 2 keys
    //nickname and password with the values established from req.body on line 33.
    newUser.nickname = nickname;
    newUser.password = password;

    //we then call our insert S/O method passing in our db connection and our
    //newUser object above. The `return knex` of our SO method returns the Promise 
    //object to this caller, and the return rows[0] returns the value to the caller's 
    //.then() promise clause.
    UsersService.insertUser(knexInstance, newUser)
      .then(user => {
        res
          .status(201)
          //send the location of the resource we just created
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          //send the object in our res.json since its a POST
          .json(serializeUser(user))
      })
      .catch(next)
  })

usersRouter
  .route('/:user_id')
  .all((req, res, next) => { 
    //loads service method for getById at the path specified above
    //for all HTTP request methods (?)
    const knexInstance = req.app.get('db')
    const user_id = req.params.user_id
    UsersService.getById(knexInstance, user_id)
      .then(user => {
        if(!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user))
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db')
    const user_id = req.params.user_id
    UsersService.deleteUser(knexInstance, user_id)
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db')
    const user_id = req.params.user_id
    const { fullname, username, nickname, password } = req.body
    const userToUpdate = { fullname, username, nickname, password }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'fullname', 'username', 'nickname' or 'password'`
        }
      })
    
    UsersService.updateUser(knexInstance, user_id, userToUpdate)
      .then(updatedRow => {
        res.status(200).json(updatedRow)
      })
      .catch(next)
  })

module.exports = usersRouter