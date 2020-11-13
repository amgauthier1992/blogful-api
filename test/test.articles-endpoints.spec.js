require('dotenv').config()
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app')
const { makeArticlesArray } = require('./articles.fixtures') 

describe('Articles Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db) 
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('blogful_articles').truncate())

  afterEach('cleanup', () => db('blogful_articles').truncate())

  describe(`GET /articles`, () => {
    context(`Given no articles`, () => {
        it(`responds with 200 and an empty list`, () => {
            return supertest(app)
            .get('/articles')
            .expect(200, [])
        })
    })

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray(); //refactoring to use the exported function from
      //articles.fixtures.js. The result of this function gives us our test data, rather than
      //hardcoding it in this file. We require the file above on Line 3. This above change
      //allows us to generate these test articles in different contexts below as well.

      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles)
      })

      it('responds with 200 and all of the articles', () => {
      //the app is the express instance we create in src/app.js. The express instance
      //expects the req.app.get('db) to return the Knex instance. As we're running
      //tests, we skipped the server.js file, so the get('db') call won't work.
      //We need to use app.set like we did in our server.js file in our before hook
      //above (line 13).
      return supertest(app)  
        .get('/articles')
        .expect(200, testArticles)
      })
    })
  })

  describe(`GET /articles/:article_id`, () => {
    context('Given there are no articles' , () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .get(`/articles/${articleId}`)
          .expect(404, { error: { message: `Article doesn't exist` } }) 
          //this test will fail since we havent wired up the endpoint to return  
          //the JSON message we're specifying as a result of a 404 Not Found err
      }) 
    })

    context('Given there are articles in the database', () => {
      const testArticles = makeArticlesArray()

      beforeEach('insert articles', () => {
        return db
          .into('blogful_articles')
          .insert(testArticles)
      })

      it('responds with 200 and the specified article', () => {
        const articleId = 2
        const expectedArticle = testArticles[articleId - 1]
          return supertest(app)
            .get(`/articles/${articleId}`)
            .expect(200, expectedArticle) 
            ////this will fail since we havent created the endpoint yet. However, it fails
            //on the beforeEach step. This is because beforeEach is inserting the same articles
            //every test, but each article needs a unique id value. Since we aren't truncating
            //the table after each test as well, this is why its failing. We want to fix our
            //"test leaks" by making sure we clean up after every test.
        })
      })
    })
})