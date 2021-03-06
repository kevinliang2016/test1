

/**
 * PM2 programmatic API tests
 */

var pm2    = require('../..');
var should = require('should');
var assert = require('better-assert');
var path   = require('path');

describe('PM2 programmatic calls', function() {

  var pm2_bus = null;
  var proc1   = null;
  var procs   = [];

  after(function(done) {
    pm2.delete('all', function(err, ret) {
      pm2.disconnectBus();
      pm2.disconnect(done);
    });
  });

  before(function(done) {
    pm2.connect(function() {
      pm2.launchBus(function(err, bus) {
        pm2_bus = bus;

        pm2.delete('all', function(err, ret) {
          done();
        });
      });
    });
  });

  /**
   * process.on('message', function(packet) {
   *   process.send({
   *     topic : 'process:msg',
   *     data  : {
   *       success : true
   *     }
   *   });
   * });
   */
  it('should start a script', function(done) {
    pm2.start({
      script : './test/fixtures/send-data-process/return-data.js'
    }, function(err, data) {
      proc1 = data[0];
      should(err).be.null;
      done();
    });
  });

  it('should receive data packet', function(done) {
    pm2_bus.on('process:msg', function(packet) {
      packet.raw.data.success.should.eql(true);
      packet.raw.topic.should.eql('process:msg');
      packet.process.pm_id.should.eql(proc1.pm2_env.pm_id);
      packet.process.name.should.eql(proc1.pm2_env.name);
      done();
    });

    pm2.sendDataToProcessId(proc1.pm2_env.pm_id, {
      topic : 'process:msg',
      data : {
        some : 'data',
        hello : true
      }
    }, function(err, res) {
      should(err).be.null;
    });
  });

});
