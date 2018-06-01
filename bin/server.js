const Hapi = require('hapi')
const log = require('pino')()

const SERVER_PORT = 5000

async function start () {
  try {
    const server = Hapi.Server({
      port: SERVER_PORT
    })
    await require('./api').initialize(server)
    server.start()
    log.info(`Server running at port ${SERVER_PORT}`)
  } catch (err) {
    log.error(err)
    throw err
  }
}
start()
