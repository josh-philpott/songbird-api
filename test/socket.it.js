const app = require('../app')
const supertest = require('supertest')
const io = require('socket.io-client')
const http = require('http')
const setupWebsockets = require('../websockets/setup')

const ioOptions = {
  forceNew: true,
  reconnection: false
}
const testMsg = 'HelloWorld'
let broadcaster
let listener

describe('websocket events', function() {
  let server
  let request

  beforeAll(done => {
    server = http.createServer(app)
    setupWebsockets(server)
    server.listen(7000)
    request = supertest(server)
    done()
  })
  beforeEach(async () => {
    // connect two io clients
    broadcaster = io('http://localhost:7000/', ioOptions)
    listener = io('http://localhost:7000/', ioOptions)
  })
  afterEach(done => {
    // disconnect io clients after each test
    broadcaster.disconnect()
    listener.disconnect()
    done()
  })

  afterAll(done => {
    server.close(done)
  })

  describe('echo event', function() {
    it('Clients should receive a message when the `echo` event is emited.', function(done) {
      broadcaster.emit('echo', testMsg)
      listener.on('echo', function(msg) {
        expect(msg).toEqual(testMsg)
        done()
      })
    })
  })

  describe('initialize broadcast', function() {
    it('sender should receive sob after broadcast intialized', done => {
      broadcaster.emit('init broadcast', '123', 'test', 'testImageUrl')
      broadcaster.on('sob', function(sob) {
        expect(sob.currentlyPlaying).toBeNull()
        expect(sob.broadcastMeta.id).toEqual('123')
        expect(sob.broadcastMeta.profileImageUrl).toEqual('testImageUrl')
        expect(sob.broadcastMeta.displayName).toEqual('test')
        done()
      })
    })
  })

  describe('API Tests', function() {
    it('should return version number', function(done) {
      request.get('/api').end(function(err, res) {
        console.log(res.body)
        expect(res.body.version).toEqual(1)
        expect(res.statusCode).toEqual(200)
        done()
      })
    })
  })
})
