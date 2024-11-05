// env variables
require('dotenv').config({ path: './.env' })

const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const cors = require('cors')


// initialize server
const app = express()

// configuration
app.set('trust proxy', 1)
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
})
const logger = require('./shared-utils/logging')
const port = process.env.PORT || 3000
const ServerError = require('./shared-utils/error')


// Middleware

// 1- Cors
app.use(cors())

// 2- Logger Middleware
app.use((req, res, next) => {
    logger.info(`[${req.method}] ${req.url}`)
    next()
})

// 3- Set security HTTP headers
app.use(helmet())

// 4- rate limiter
app.use(limiter)

// 5- body parser
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Routes
app.use("/api/v1/auth",require('./users/routes/auth.route'))



// Collect Errors
app.all('*', (req, res, next) => {
    next(new ServerError(`Can't find ${req.originalUrl} on this server!`, 404))
})


// Start the server
app.listen(port, () => {
  console.log(`server is running on port ${port}...`)
})

module.exports = app