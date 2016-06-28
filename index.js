/**
 * Your slackbot token is available as the global variable:

process.env.SLACKBOT_TOKEN

 * When deployed to now.sh, the URL of your application is available as the
 * global variable:

process.env.NOW_URL

 * The URL is useful for advanced use cases such as setting up an Outgoing
 * webhook:
 * https://github.com/howdyai/botkit/blob/master/readme-slack.md#outgoing-webhooks-and-slash-commands
 *
 */



var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
	token: process.env.SLACKBOT_TOKEN
})
bot.startRTM(function(error, whichBot, payload) {
	if (error) {
		throw new Error('Could not connect to Slack');
	}
});


// helper functions
var botLog = (param)=>{
	console.log("\x1b[34m", param, "\x1b[0m")
}
var safeLog = (param)=> {
	console.log("\x1b[32m", param, "\x1b[0m")
};
var dangerLog = (param)=>{
	console.log("\x1b[31m", param, "\x1b[0m")
}
var warnLog = (param)=>{
	console.log("\x1b[33m", param, "\x1b[0m")
}

var r = function(min, max){
	return min + (Math.floor(Math.random()*max))
};

safeLog('bot start')


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// HANGMAN BOT ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

var hangmanConfig = { // not full in use yet
	javascript: {
		intro: 'Can you guess the word from this JavaScript inpsired set?',
		text: 'Play by either choosing letters or go for the whole word if you think you have it.\nYou can end the game at any time by typing \`quit\`',
		words: [
			'method',
			'function',
			'jquery',
			'closures',
			'variable',
			'scope',
			'object',
			'awesome',
			'array',
			'api',
			'callback',
			'javascript',
			'concatenate',
			'promise',
			'asynchronous',
			'github',
			'queryselector',
			'delegate',
			'dom',
			'refactor'
		]
	},
	images: [
		'https://dl.dropboxusercontent.com/u/6839372/hangmanBotArtwork/hangman_1.jpg',
		'https://dl.dropboxusercontent.com/u/6839372/hangmanBotArtwork/hangman_2.jpg',
		'https://dl.dropboxusercontent.com/u/6839372/hangmanBotArtwork/hangman_3.jpg',
		'https://dl.dropboxusercontent.com/u/6839372/hangmanBotArtwork/hangman_4.jpg',
		'https://dl.dropboxusercontent.com/u/6839372/hangmanBotArtwork/hangman_5.jpg',
		'https://dl.dropboxusercontent.com/u/6839372/hangmanBotArtwork/hangman_6.jpg'
	],
	colour: {
		blue: '#3aa3e3'
	},
	restrictedAccess: {
		status: true,
		users: [ 'amysimmons', 'martin', 'jess'],
		title: "Access denied",
		text: 'This game is still in development, you do not have access to play yet.'
	},
	users: {}
};

hangmanConfig.javascript.words = hangmanConfig.javascript.words.map( (v,i,a) => {
	return v.toUpperCase();
});

// command to start a game
var startGameCommand = 'test hangman';
// start hangman game
controller.hears( startGameCommand, 'direct_message', (bot, message)=>{

	hangmanConfig.users[message.user] = {};
	hangmanConfig.users[message.user].userGuesses = [];
	hangmanConfig.users[message.user].wrongGuessCount = 0;
	hangmanConfig.users[message.user].puzzleView = [];
	var puzzleView = hangmanConfig.users[message.user].puzzleView = [];

	// set up
	var mKeys = Object.keys(message);
	bot.botkit.log(mKeys);
	var playerName;
//	var puzzleWord = [];
//	var puzzleView = [];
//	var wrongGuessCount = 0;
	//var guessLetter;
	var answer = (puzzleView)=>{
		return (puzzleView.toString().replace(/,/g, ''));
	}
	var gameInPlay = false;
	//var userGuesses = [];
	var alphabet = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	hangmanConfig.users[message.user].alphabet = alphabet;
	var chooseWord = ()=>{
		return (hangmanConfig.javascript.words[r(0, hangmanConfig.javascript.words.length)])
	}
	var markDownFields = ["text", "pretext", 'fields', 'value'];

	var remainingLetters = ()=>{
		return	'\*You have these letters left:\*\n' + '\`\`\`' + hangmanConfig.users[message.user].alphabet.join('  ') + '\`\`\`'
	}

	// game timer
	var t=0;
	var gameTimer;
	function startGameTimer(){
		gameTimer = setInterval(gameTimerAction, 100);
	}
	function gameTimerAction(){
		t+=1
	};
	function stopGameTimer(){
		clearInterval(gameTimer);
		if ((t / 10) < 60){
			t = (t/10) + ' seconds'
		} else {
			t = Math.floor((t / 10) / 60) + ' minutes ' + Math.floor((t/10) % 60) + ' seconds'
		}
		botLog('time: ' + t );
	}

	// get online users
	var onlineUserList = [];
	function getHumanUsersPresence(id){
		bot.api.users.getPresence({'user': id}, function(err, response){
			if (response.presence == 'active'){
				onlineUserList.push(id)
			}
		})
	};
	function pushUserNames(id, userName){
		bot.api.users.getPresence({'user': id}, function(err, response) {
			if (response.presence == 'active'){
				onlineUserList.push(userName);
				botLog('id: ' + userName);
			}	
		})
	}
	// get human users	
	function getHumanUsers(){
		bot.api.users.list({},function(err,response) {
			if (err) {bot.botkit.log('something went wrong', err)};
			var output = [];
			var l = response.members.length
			for (var i=0; i<l; i++){
				
				if ( !response.members[i].is_bot && response.members[i].name !== 'slackbot'){
					//var realName = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name // get realreal name
					var id = response.members[i].id;
					var userName = response.members[i].name;
					pushUserNames(id, userName)
				}
			} // end for loop
		}); // end api call
	} // end function	

	// post message to other channel
	function postToChannel( playerName, wrongGuessCount, gameWin ){
		var postMsg = {
			channel: 'C1HC4RN1H', 		// channel id - req
			attachments: [
				{
					'title': (()=>{
						warnLog('checking results...');
						if ( gameWin === true ){
							return playerName + ' won a game of hangman'
						} else {
							return playerName + ' lost a game of hangman'
						}
					})(),
					'text': (()=>{
						if (gameWin === true){
							return 'Found the right answer in '+ t +' seconds with ' + wrongGuessCount + ' wrong guesses'
						} else {
							return 'Failed to find the right answer in '+ t +' seconds'
						}
					})(),
					'color': (()=>{
						if (gameWin === true){
							return 'good'
						} else {
							return 'danger'
						}
					})(),
					'as_user': 'U1HDDKWCD',
					'username': 'U1HDDKWCD',		
					'icon_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
					"mrkdwn_in": markDownFields
				}
			]
		}
		bot.api.chat.postMessage(postMsg);
	};



	// api call for user information
	bot.api.users.info({'user': message.user}, (err, response)=>{
		botLog(response.user.name);
		playerName = response.user.name;

		// check user is allowed to play
		function setUpGame(){
			// if user allowed to play
			// gameInPlay = true;
			startGameTimer();
			safeLog('game on');
			// quiz setup
			//chosenWord = chooseWord()
			
			//hangmanConfig.users = {};
			//hangmanConfig.users[message.user] = {};
			hangmanConfig.users[message.user].currentWord = chooseWord();
			hangmanConfig.users[message.user].gameInPlay = true;
			//hangmanConfig.users[message.user].puzzleview = [];

			var chosenWord = hangmanConfig.users[message.user].currentWord;
			gameInPlay = hangmanConfig.users[message.user].gameInPlay;
			

			botLog('chosenWord = ' + chosenWord);
			for(var i=0; i<chosenWord.length; i++){
				hangmanConfig.users[message.user].puzzleView.push('—');
			};
			botLog('puzzleview: ' + hangmanConfig.users[message.user].puzzleview);
			puzzleview = hangmanConfig.users[message.user].puzzleview;
			bot.startConversation(message, showIntro);
		}

		function accessedDenied(){
			dangerLog('Access denied. | Game not started');
			gameInPlay = false;
			bot.startConversation(message, showAccessDenied);
		}

		if( hangmanConfig.restrictedAccess.status === true ){
			for(let i = 0; i < hangmanConfig.restrictedAccess.users.length; i++ ){
				if ( playerName === hangmanConfig.restrictedAccess.users[i] && !gameInPlay ){
					setUpGame();
					warnLog('restricted true and allowed');
					return false
				} else if (i === (hangmanConfig.restrictedAccess.users.length -1)) {
					accessedDenied();
					warnLog('restricted true and denied');
					//return true
				}
			}
		} else if ( hangmanConfig.restrictedAccess.status === false ){
			setUpGame();
			warnLog('restricted false and allowed')
			//return false
		} else {
			accessedDenied()
			warnLog('restricted false and denied - something has gone wrong');
			//return false
		}
	}); // end of user verification


	// start game - showing game intro
	showIntro = (response, convo)=>{
		let intro = {
			attachments: [
				{
					title: hangmanConfig.javascript.intro,
					text: hangmanConfig.javascript.text,
					mrkdwn_in: markDownFields
				}
			]
		};
		convo.say(intro);
		askLetter(response, convo, puzzleView);
		convo.next()
	};

	// accessed denied
	showAccessDenied = (response, convo)=>{
		let intro = {
			attachments: [
				{
					title: hangmanConfig.restrictedAccess.title,
					text: hangmanConfig.restrictedAccess.text,
					color: 'danger',
					mrkdwn_in: markDownFields
				}
			]
		};
		convo.say(intro);
		convo.next()
	}
	
	// bot asks for letter / start convo
	askLetter = (response, convo, puzzleview)=> {
		
		let reply = {
			// include an introduction to the game
			'attachments': [
				{
					'title': puzzleView.join('  ') ,
					'text': 'Pick a letter...',
					//'image_url': hangmanConfig.images[wrongGuessCount],
					"mrkdwn_in": markDownFields
				}
			]
		}
		convo.ask(reply , function(response, convo) {
			botLog('response keys: ' + Object.keys(response) + ' | ' + response.user)

			hangmanConfig.users[response.user].guessLetter = (response.text).toUpperCase()
			var guessLetter = hangmanConfig.users[response.user].guessLetter

			var userGuesses = hangmanConfig.users[response.user].userGuesses

			var chosenWord = hangmanConfig.users[response.user].currentWord;
			var wrongGuessCount = hangmanConfig.users[message.user].wrongGuessCount

			puzzleview = hangmanConfig.users[response.user].puzzleView;

			// filter previous guesses against new guess
			hangmanConfig.users[response.user].filterGuesses = userGuesses.filter( (v,i,a)=>{
				return guessLetter === v
			});
			var filterGuesses = hangmanConfig.users[response.user].filterGuesses;

			var alphabet = hangmanConfig.users[response.user].alphabet
			botLog( ('filtered guesses: '+ filterGuesses + ', length: ' + filterGuesses.length) )

			// compare guess letter to previous letter useage
			// if letter hasn't been played filterGuesses is empty,
			// and if entry doesn't match full puzzleWord
			// -- change to filer/map?
			if( filterGuesses.length === 0 && guessLetter !== chosenWord ){
				for ( var i=0; i<alphabet.length; i++ ){
					if ( guessLetter === alphabet[i]) {
						hangmanConfig.users[response.user].alphabet[i] = ' ';
						hangmanConfig.users[response.user].userGuesses.push(guessLetter);
					} 
				}
			}

			var status = false;
			botLog(('playing: ' + guessLetter))
			// check letter against each letter in puzzle, update puzzleView with letter guessed
			for(let i = 0; i<(chosenWord.length); i++){
				// if guess matches letter at index and is not a repeat and doesn't match puzzleWord
				if( (guessLetter === chosenWord[i]) && (filterGuesses.length === 0) && (response.text.toUpperCase() !== chosenWord) ){ 
					status = true; // is correct guess
					hangmanConfig.users[response.user].puzzleView[i] = guessLetter; // update puzzleView
					puzzleview = hangmanConfig.users[response.user].puzzleView;
					botLog(puzzleView);
				} 
			}
			botLog('answer: ' + answer(puzzleview) + ' | status: ' + status)


			// actions to take /////////////
			// if user types 'quit'
			if(response.text === 'quit'){
				stopGameTimer();
				let reply = {
					'attachments': [
						{
							'title': 'Quitting...',
							'color': 'warning',
							"mrkdwn_in": markDownFields
						}
					]
				}
				convo.say(reply)
				quitGame(response, convo);
				convo.next();
			} 
			// if user tries to start a new game while another is already in play
			else if (response.text === startGameCommand){
				convo.say('you\'re already playing!')
			}

			// if user guess whole word
			else if (response.text.toUpperCase() === chosenWord ){
				botLog(response.text)
				safeLog('full answer correct ' + chosenWord );
				stopGameTimer();
				getHumanUsers(); // run function to find all human users in group

				let reply = {
					'attachments': [
						{
							'title': 'Winner!',
							"fields": [
								{
									"title": "The word was:" ,
									"value": ' \_' + chosenWord + '\_',
									"short": true
								},
								{
									"title": "You got it in" ,
									"value": (t) + ' seconds',
									"short": true
								},
							],
							'color': 'good',
							//'image_url': hangmanConfig.winImage, // new image for win state?
							"mrkdwn_in": markDownFields
						}
					]
				};
				convo.say(reply);
				postToChannel( playerName, wrongGuessCount, true )
				asktoChallenge(response, convo);
				convo.next();
			}

			// win game by guessing last letter
			else if ( answer(puzzleview) === chosenWord ) {
				stopGameTimer();
				getHumanUsers(); // run function to find all human users in group
				safeLog( 'winner! guessed all correct letters');
				let reply = {
					'attachments': [
						{
							'title': 'Winner!',
							"fields": [
								{
									"title": "The word was:" ,
									"value": ' \_' + chosenWord + '\_',
									"short": true
								},
								{
									"title": "You got it in" ,
									"value": (t) + ' seconds',
									"short": true
								},
							],
							'color': 'good',
							//'image_url': hangmanConfig.winImage, // win image
							"mrkdwn_in": markDownFields
						}
					]
				}
				convo.say(reply);
				postToChannel( playerName, wrongGuessCount, true );
				asktoChallenge(response, convo);
				convo.next();
			} 

			// guess correct letter
			else if ( status && filterGuesses.length ===0) {
				safeLog( 'correct!, guess again');
				botLog(answer(puzzleview) + " | " + chosenWord )
				let reply = {
					'attachments': [
						{
							'title': 'Correct!',
							'text': remainingLetters(),
							'color': 'good',
							//'image_url': hangmanConfig.images[wrongGuessCount],
							"mrkdwn_in": markDownFields
						}
					]
				}
				convo.say(reply);
				askLetter(response, convo, puzzleview);
				convo.next();				
			} 

			// game over - ran out of lives
			else if (wrongGuessCount >= 4){
				hangmanConfig.users[message.user].wrongGuessCount += 1;
				var wrongGuessCount = hangmanConfig.users[message.user].wrongGuessCount
				stopGameTimer();
				dangerLog('you lose, game over');
				let reply = {
					'attachments': [
						{
							'title': 'Game over!',
							'text': 'Better luck next time',
							'color': 'danger',
							'image_url': hangmanConfig.images[wrongGuessCount],
							"mrkdwn_in": markDownFields
						}
					]
				};
				postToChannel( playerName, wrongGuessCount, false );
				convo.say(reply)
				convo.next();
			}

			// played a repeat letter 
			else if ( filterGuesses.length > 0 ) {
				let reply = {
					'attachments': [
						{
							'title': 'Oops, already played that one, try again',
							'text': remainingLetters(),
							"mrkdwn_in": markDownFields
						}
					]
				};
				convo.say(reply);
				askLetter(response, convo, puzzleview);
				convo.next();
			}

			// user guessed wrong
			else {
				dangerLog('wrong guess');
				warnLog ('wronguesscount ' + wrongGuessCount);
				botLog(hangmanConfig.images[wrongGuessCount])
				hangmanConfig.users[message.user].wrongGuessCount += 1;
				var wrongGuessCount = hangmanConfig.users[message.user].wrongGuessCount
				botLog ('wronguesscount ' + wrongGuessCount);
				botLog(hangmanConfig.images[wrongGuessCount])
				let reply = {
					'attachments': [
						{
							'image_url': hangmanConfig.images[wrongGuessCount],
							'title': 'Wrong',
							'text': remainingLetters(),
							'color': 'danger',
							"mrkdwn_in": markDownFields
						}
					]
				}
				convo.say(reply);
				askLetter(response, convo, puzzleview);
				convo.next();
			} 
		})
	} // end of ask convo

	// challenge someone else
	challenge = function(response, convo) {
		let reply = {
			'attachments': [
				{
					'title': onlineUserList.join(', '),
					'text' : 'are online now, find out out who\'s better',
					'color': hangmanConfig.colour.blue,
					"mrkdwn_in": markDownFields
				}
			]
		}
		convo.say( reply );
		convo.next();	
		gameInPlay = false;	
	};

	// ask user if they want to see who else is online
	asktoChallenge = function(response, convo) {
		let askToFuindUsers = {
			'attachments': [
				{
					'text':  "\*Do you want to see who's online now?\* \_(yes / no)\_",
					"mrkdwn_in": markDownFields
				}
			]
		}
		convo.ask( askToFuindUsers, function(response, convo) {
			if(response.text.toUpperCase() === 'YES' || response.text.toUpperCase() === 'Y'){
				let reply = {
					'attachments': [
						{
							'title':  'Looking for players...'
						}
					]
				}
				botLog('online users: ' + onlineUserList.join(', ') );
				convo.say( reply )
				challenge(response, convo);
				convo.next();
			} 
			else {
				convo.say('thanks for playing');
				convo.next();
			}
		})	
	}

	// quit game
	quitGame = (response, convo)=>{
		let reply = {
			'attachments': [
				{
					'title': 'The game has quit',
					'text': 'Play again?',
					"mrkdwn_in": markDownFields
				}
			]
		};
		convo.say(reply);
		convo.next();
		gameInPlay = false;
	}

	
}); // end of hangman


/*
# To do list

## Priority
- tidy up code/notes
- introduce new step for intro before ask for letter


### in no particular order
- scoreboard ? / store results ?
- different word groups/themes 
- create your own quiz to challenge others / temp storage / factory function
- start game in private chat from other channels
- move into bot-test-clyde channel
- attachment reponse as template function
- random messages on right/wrong guess
- capture player name in config and store puzzleWord as key/value
- store player results in config object
- add timeout to ask to find users to prevent memory leak
- trade life for letter


## in prgress
- all info into single game object 


## Done
- display timer in results
- check whole word for answer 
- get list of active users
- draw artwork for gallowes
- add gallowes artwork
- format challenge messages
- put all messages in as attachements
- win by guessing letters
- show images for wrong and game over screens
- conditional for timer to show minutes and seconds
- post results of game into #clyde-bot-test channel 
- include intro for theme of words
- store game words and active status in object under name (allow multiple players at once?)
*/



// weather bot!
controller.hears('weather in (.*)', 'direct_mention', (bot, message)=>{
	require('isomorphic-fetch');

	process.env.FORECAST_KEY;
	var location = message.match[1];

	var units = (param)=>{
		return '?units='+param
	};

	fetch('http://maps.googleapis.com/maps/api/geocode/json?address=' + location).then( (response)=>{
		//console.log(response)
		return response.json()
	}).then( (dataJSON)=>{
		console.log('Lat:', dataJSON.results[0].geometry.location.lat);
		console.log('Long:', dataJSON.results[0].geometry.location.lng);

		// store lat and lng values form the json 
		var lat = (dataJSON.results[0].geometry.location.lat).toString();
		var lng = (dataJSON.results[0].geometry.location.lng).toString();

		// concateneate them to use in the url
		var location = lat + ',' + lng
		// return location string up to the Promise
		return location

	}).then( (dataLocation)=>{
		fetch('https://api.forecast.io/forecast/' + process.env.FORECAST_KEY + '/' + dataLocation + units('si')).then( (response)=>{
				return response.json()
			}).then( (dataJSON)=>{
				console.log('weather summary:', dataJSON.currently.summary);
				console.log('current temperature:', dataJSON.currently.temperature);
				console.log('current humidity:', dataJSON.currently.humidity);
				var forecast = 'The current weather in ' + location + ' is ' + dataJSON.currently.summary + ' with a temperature of ' + dataJSON.currently.temperature + 'C'
				bot.reply(message, forecast)
			})
	}).catch( (dataLocation)=> {
		console.log('ERROR!')
	})
})