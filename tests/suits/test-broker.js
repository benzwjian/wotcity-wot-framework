var assert = require('assert');
var coap = require('coap');
var WebsocketClient = require('websocket').client;
    
describe('CoAP Broker', function(){
	var res = '';

	beforeEach(function(done) {
		var viewer = coap.request({
			'hostname': '127.0.0.1',
			'port': 8000,
			'pathname': '/object/5550937980d51931b3000009/viewer',
			'observe': true
		});
		viewer.on('response', function(data) {
		    res = data.read().toString();
		    done();
		});
		viewer.end();

		var sender = coap.request('coap://127.0.0.1:8000/object/5550937980d51931b3000009/send');
		sender.end(new Buffer(JSON.stringify({foo: 'bar'})));
	});

    it('should pass', function () {
        assert.equal(res, JSON.stringify({foo: 'bar'}));
    });

});

describe('Websocket Broker', function(){
	var res = '';

	beforeEach(function(done) {
		var viewer = new WebsocketClient();

		viewer.on('connect', function(connection) {
		    connection.on('message', function(message) {
		        if (message.type === 'utf8') {
		            res = message.utf8Data;
		            done();
		        }
		    });
		});

		viewer.connect('ws://127.0.0.1:8000/object/5550937980d51931b3000009/viewer', '');

		var sender = new WebsocketClient();

		sender.on('connect', function(conn) {
			conn.sendUTF(JSON.stringify({foo: 'bar'}));
		});

		sender.connect('ws://localhost:8000/object/5550937980d51931b3000009/send', '');
	});

    it('should pass', function () {
        assert.equal(res, JSON.stringify({foo: 'bar'}));
    });

});
