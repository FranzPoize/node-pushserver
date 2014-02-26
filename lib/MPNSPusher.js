/**
 * Created with a brain.
 * User: FranzP
 * Date: 26/02/14
 * Time: 19:49
 */

var config = require('./Config')
var _ = require('lodash');
var mpns = require('mpns');
var moment = require('moment');
var pushAssociations = require('./PushAssociations');
var fs = require('fs');
var pushAssociations = require('./PushAssociations');

var buildPayload = function(options) {
	var notif = options;
	notif.options.cert = fs.readFileSync(config.get('mpns').cert),
    notif.options.key = fs.readFileSync(config.get('mpns').key)
	return options;
}

var push = function(tokens,message) {

	_.each(tokens,function(token) {

		function defaultCallback(err,result) {
			err.shouldDeleteChannel && deleteUser(tokens)
			err.minutesToDelay && delayUser(tokens,err.minutesToDelay)
		}

		var delayEnd = token.delay && moment(token.delayDate).add('h',token.delay);

		if (delayEnd.isBefore(moment())) {
			if (message.type === 'toast') {
				mpns.sendToast(token.token,message,defaultCallback);
			} else if (message.type === 'tile') {
				mpns.sendTile(token.token,message,defaultCallback);
			} else if (message.type === 'iconic') {
				mpns.sendIconicTile(token,message,defaultCallback);
			}
		}
	})
}

function deleteUser (token) {
	pushAssociations.removeDevice(token);
}

function delayUser(token,delay) {
	pushAssociations.updateDelay(token,delay);
}

module.exports = {
    push: push,
    buildPayload: buildPayload
}