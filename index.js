const app = require('./app')
const setupWebsockets = require('./websockets/setup')

const port = parseInt(process.env.PORT, 10) || 3001

const server = require('http').createServer(app)
setupWebsockets(server)

server.listen(port, () => console.log(`Songbridge api started on port ${port}`))
