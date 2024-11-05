const server = require('./app')

// process.on('unhandledRejection', (err) => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...')
//   console.log(err.name, err.message)
//   server.close(() => {
//     process.exit(1)
//   })
// })

// process.on('SIGTERM', () => {
//   console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
//   server.close(() => {
//     console.log('💥 Process terminated!')
//   })
// })

// process.on('uncaughtException', (err) => {
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
//   console.log(err)
//   process.exit(1)
// })