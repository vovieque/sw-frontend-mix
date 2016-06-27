const hostname = '127.0.0.1';
const port = 3000;
const express = require('express');
const app = express();
const request = require('request');

app.use('/', express.static('static'));

app.get('/ajax/get-frontend-tweets', (req, res) => {
	const bearerToken = require('./config').bearer_token;
	const getTweetsUrl = 'https://api.twitter.com/1.1/search/tweets.json?q=%23frontend&result_type=recent';

	var requestOpts = {
		url: getTweetsUrl,
		headers: {
			'Authorization': `Bearer ${bearerToken}`
		}
	};
	request(requestOpts, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.set('Content-Type', 'application/json; charset=utf-8');
			res.send(body);
		} else {
			res.send(error || response);
		}
	});
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
