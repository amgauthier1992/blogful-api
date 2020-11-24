//Load the .env file in tests using dotenv in your ./test/setup.js 
//so that we can access the TEST_DB_URL from within our tests:

//***this file and all other test files have to be inside the same 
//test directory. You cannot nest other directories inside test
//unless you want to make custom scripts to test each series
//of endpoints. Easier and cleaner to run npm test once and have
//all tests run.***

require('dotenv').config()
// process.env.TZ = 'UTC'
process.env.NODE_ENV = 'test'
const { expect } = require('chai');
const supertest = require('supertest');

global.expect = expect;
global.supertest = supertest;
