require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app
  .use(cors())
  .use(express.json())
  .use('/api', require('./api/routes'))

  .listen(3000, () => {
    console.log('Listening on port 3000')
  })
