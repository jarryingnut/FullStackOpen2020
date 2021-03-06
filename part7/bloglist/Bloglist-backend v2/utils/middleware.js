const logger = require('./logger')
const jwt = require('jsonwebtoken')


const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const authenticateToken = (request, response, next) => {
  const authorization =  request.get('authorization')
  
  const token = authorization && authorization.toLowerCase().startsWith('bearer') && authorization.substring(7)
  jwt.verify(token, process.env.SECRET, (error, decodedToken) => {
    if(error){
       response.status(401).json({ error: 'token missing or invalid' })
    }
    request.decodedToken = decodedToken
    console.log('tokenU$er', decodedToken)
    next()
  })
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }
  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  authenticateToken
}