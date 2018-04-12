require("dotenv").config();
const fs = require('fs');
const request = require('request');
const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const Keys = require('./keys.js');
// const _ = require('underscore');

// // create a custom timestamp format for log statements
const SimpleNodeLogger = require('simple-node-logger'),
	opts = {
		logFilePath:'log.txt',
		timestampFormat:'YYYY-MM-DD HH:mm:ss'
	},
	log = SimpleNodeLogger.createSimpleLogger( opts );

// Add my credentials to the different Twitter and Spotify instances
let twitter = new Twitter(Keys.twitterKeys);
let spotify = new Spotify(Keys.spotifyKeys);
let twitterUser = "@M_Beth_A";
let commandError = "Invalid command. Use one of the following commands:"+
	"\nmy-tweets \nspotify-this-song \nmovie-this \ndo-what-it-says";
let arg = process.argv;
let command = arg[2];
let search = arg[3];
if(search !== undefined){
	for(var i = 4; i < arg.length; i++){
		search += "+" + arg[i];
	}
}

run(command, search);


// Function that runs the command provided by node user
function run(command, search){
	switch(command){
		case "my-tweets":
			myTweets();
			break;
		case "spotify-this-song":
			spotifyThisSong(search);
			break;
		case "movie-this":
			movieThis(search);
			break;
		case "do-what-it-says":
			doWhatItSays();
			break;
		// Print error if user enters invalid command
		default:
			log.error(commandError);
	}
}

// Function shows your last 20 tweets and when they were created at in your terminal/bash window.
function myTweets(){
	log.info("--------------------------------RECENT TWEETS--------------------------------");
	twitter.get('statuses/user_timeline', {q: twitterUser}, function(error, tweets, response) {
   		if(error) log.error(error);
		for(var i = 0; i < tweets.length && i < 20; i++){
			log.info(tweets[i].created_at + ": " + tweets[i].text);
		}
	});
}

// Function shows Artist(s), song's name, preview link from Spotify, and album
function spotifyThisSong(song){
	log.info("--------------------------------SPOTIFY SONG--------------------------------");
	if(song === undefined){
		song = "My+Immortal";
	}	
	spotify.search({ type: 'track', query: '"'+song+'"', limit: 1 }, function(err, data) {
		if(err){
			return log.error('Error occurred: ' + err);
		}
		var songInfo = data.tracks.items[0];
		var artist = [];
		for(var i = 0; i < songInfo.artists.length; i++){
			artist.push(songInfo.artists[i].name);
		}
		log.info("Artist(s): " + artist);
		log.info("Track: " + songInfo.name);
		log.info("Album: " + songInfo.album.name);
		log.info("Preview: " + songInfo.preview_url);
	});
}

// Shows movie title, year, IMDB rating, Rotten Tomatoes Rating, Country produced, language, plot, actors
function movieThis(movie){
	log.info("--------------------------------MOVIE INFO--------------------------------");
	if(movie === undefined){
		movie = "Lion+King";
	}
	request("http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece", function(error, response, body) {
		if (!error && response.statusCode === 200) {
			let movieInfo = JSON.parse(body);
			let imdb = "Not rated.";
			let rt = "Not rated.";

			if(movieInfo.Ratings[0] !== undefined){
				imdb = _.find(movieInfo.Ratings, function(rating){ return rating.Source === "Internet Movie Database"}).Value;
				rt = _.find(movieInfo.Ratings, function(rating){ return rating.Source === "Rotten Tomatoes"}).Value;
			}
			log.info("Movie Title: " + movieInfo.Title);
			log.info("Year: " + movieInfo.Year);
			log.info("IMDB Rating: " + imdb);
			log.info("Rotten Tomatoes Rating: " + rt);
			log.info("Country: " + movieInfo.Country);
			log.info("Language: " + movieInfo.Language);
			log.info("Plot: " + movieInfo.Plot);
			log.info("Actors: " + movieInfo.Actors);		
		}
	});
}

function doWhatItSays(){
	fs.readFile('random.txt', 'utf8', function(err, data){
		if(err) return log.error(err);
	
	var arg = data.split(",");
	
	let search = arg[1].replace(/"/g, '');
	search = search.replace(/ /g, '+');

	run(arg[0], search);
	});
}