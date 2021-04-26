
require('dotenv').config();
const twit = require('./twit');
const fs = require('fs');
const path = require('path');
const fineName = 'params.json';
const paramsPath = path.join(__dirname, fineName);
let counter = 0;
let tweetsDone;
let tweets_Done = {};

const writeParamsFile = async () => {

	try {

		console.log('- Writing the params file... ');

		await fs.access(paramsPath, fs.constants.W_OK, (err) => {

			if (err) {

				console.error(`${fineName} canot be access!!`);

			} else {

				console.error(`${fineName} is accessible!!`);
				
				fs.writeFileSync(paramsPath, JSON.stringify(tweets_Done));
			}
		});

	} catch (error) {
		console.log('Error happened on writeParamsFile: ', error);
	}
}

const readParams = () => {

	try {
		console.log('- Reading params file...');

		const data = fs.readFileSync(paramsPath);

		return JSON.parse(data.toString());

	} catch (error) {
		console.log('Error happened on readParams: ', error);
	}
}

const getTweets = (since_id) => {
        return new Promise((resolve, reject) => {

                let params1 = {
                        q: ['#100DaysOfCode', '#javascript'],
                        count: 10,
                };

		let params2 = {
                        q: ['#programming', '#coding'],
                        count: 10,
                };

		let params = (counter++ === 0) || (counter-- === 1) || (--counter === 1) ? {...params1} : {...params2};

                console.log('- Getting tweets ...', params);

                twit.get('search/tweets', params, (err, data) => {

                        if (err) {

                                return reject(err);

                        }

                        return resolve(data);
                });
        });
}

const postTweetLike = (id) => {

	return new Promise((resolve, reject) => {

		let paramToLike = {
			id: id,
			tweet_id: id
		};

		const url = `favorites/create`;

		twit.post(url, paramToLike, (err, data) => {

			if (err) {

				if (!/You have already favorited this status/.test(err.message)) {
					console.log('-- Error when trying to like a Tweet: ', data);
				}

				return reject(err);

			}

			return resolve(data);
		});
		
	});

};

const postRetweet = (id) => {

        return new Promise((resolve, reject) => {

                let params = {
                        id
                };

                twit.post('statuses/retweet/:id', params, (err, data) => {

                        if (err) {

                                return reject(err);

                        }

                        return resolve(data);
                });

        });
};

const runBot = async () => {

        try {

                tweetsDone = readParams();

                const data = await getTweets();

                const tweets = data.statuses;

                console.log('- [ ' + tweets.length + ' ] - tweets');

                for await (let tweet of tweets) {

                        try {
				if (!tweetsDone[tweet.id_str] && !tweets_Done[tweet.id_str]) {

					await postRetweet(tweet.id_str);

					console.log('-- Successful retweet - ID: [ ' + tweet.id_str + ' ] ');

				}
        
                        } catch (err) {
        
				if (!/You have already retweeted this Tweet./.test(err.message)) {

	                                console.log('-- Unsuccessful retweet - ID: [' + tweet.id_str + ' ] ', err);

				}
        
                        }

			try {
				if (!tweetsDone[tweet.id_str] && !tweets_Done[tweet.id_str]) {

					await postTweetLike(tweet.id_str);

					console.log('-- Successful Liked - ID: [ ' + tweet.id_str + ' ] ');
				}
	
			} catch(err) {

				if (!/You have already favorited this status/.test(err.message)) {

					console.log('-- Unsuccessful Like - ID: [' + tweet.id_str + ' ] ', err);
				}

			}

			tweets_Done = {...tweets_Done, ...{ [tweet.id_str]: true }};

                }

                writeParamsFile();

        } catch (e) {

                console.error(e);

        }
}

module.exports = runBot;
