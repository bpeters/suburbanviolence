require('node-jsx').install({extension: '.jsx'});
var React = require('react');
var _ = require('lodash');

var App = require('../react/App.jsx');
var App = React.createFactory(App);

function paramsFromReq(req) {
	var params = _.clone(req.params);
	params.body = req.body;
	params.user = req.user;
	params.errors = req.flash('error');
	return params;
}

exports.index = function(req, res) {
	var url = req.originalUrl;
	var params = paramsFromReq(req);
	var markup = React.renderToString(App({
		title: 'Suburban Violence',
		params: params
	}));
	res.send('<!DOCTYPE html>' + markup);
};
