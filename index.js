require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
try {
  app
    .use(cors())
    .use(express.json())
    .use('/api', require('./api/routes'))

    .listen(3000, () => {
      console.log('Listening on port 3000')
    })
} catch (error) {
  console.log(error)
}