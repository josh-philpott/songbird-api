const server = require('../app')
const request = require('supertest')
const io = require('socket.io-client')

const ioOptions = {
  forceNew: true,
  reconnection: false
}
const testMsg = 'HelloWorld'
let sender
let receiver

describe('websocket events', function() {
  beforeEach(function(done) {
    // connect two io clients
    sender = io('http://localhost:3001/', ioOptions)
    receiver = io('http://localhost:3001/', ioOptions)

    // finish beforeEach setup
    done()
  })
  afterEach(function(done) {
    // disconnect io clients after each test
    sender.disconnect()
    receiver.disconnect()
    done()
  })

  describe('echo event', function() {
    it('Clients should receive a message when the `echo` event is emited.', function(done) {
      sender.emit('echo', testMsg)
      receiver.on('echo', function(msg) {
        expect(msg).toEqual(testMsg)
        done()
      })
    })
  })
})

describe('API Tests', function() {
  it('should return version number', function(done) {
    request(server)
      .get('/api')
      .end(function(err, res) {
        console.log(res.body)
        expect(res.body.version).toEqual(1)
        expect(res.statusCode).toEqual(200)
        done()
      })
  })
})
