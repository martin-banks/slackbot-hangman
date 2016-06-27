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
		users: [ 'martin', 'jess', 'amysimmons' ],
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

	// get oline users
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
				} else {
					accessedDenied();
					warnLog('restricted true and denied');
					return false
				}
			}
		} else if ( hangmanConfig.restrictedAccess.status === false ){
			setUpGame();
			warnLog('restricted false and allowed')
			return false
		} else {
			accessedDenied()
			warnLog('restricted false and denied - something has gone wrong');
			return false
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






//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// Tests and experiments /////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// list of controlls
controller.hears(['what can you do'],['mention', 'direct_message'], function(bot, message){
	var botCommands = {
		'text': 'This is what I do so far...',
		'attachments': [
			{
				'title': 'jQuery',
				'text': 'Jess-bot can\'t resist telling you what he thinks about jQuery',
			},
			{
				'title': 'what day is it?',
				'text': 'Clyde will tell you what the day is'
			},
			{
				'title': 'what is the date',
				'text': 'Clyde will tell you waht the date is'
			},
			{
				'title': 'Open the ---- doors',
				'text': 'Clyde may or may not help depending what type of door you ask him to open'
			}, 
			{
				'title': "@clydebot: what is the answer to the ultimate question",
				'text': 'You can guess what comes next... \n Use toString() on a previously created varible to return a number (as a string) into the chat'
			},
			{
				'title': 'While you\'re typing -- REMOVED',
				'text': 'Randomly return a random message while user types'
			},
			{
				'title': 'user names',
				'text': 'tpye "user list" to list all users and bots in js1syd'
			},
			{
				'title': 'human users',
				'text': 'tpye "human users" to list all users in js1syd'
			},
			{
				'title': 'bot users',
				'text': 'tpye "bot users" to list all bots in js1syd'
			},
			{
				'title': 'user ---',
				'text': 'tpye "users" and their user/screen name for basic user information including their online status'
			},
			{
				'title': 'Random emoji',
				'text': 'Display a random emoji character'
			}
		]
	}
	return bot.reply(message, botCommands)
});


var randomNumber = function(param){
	return (Math.floor(Math.random()*param))
}


controller.hears(['hello'], ['mention'], function(whichBot, message) {
	whichBot.reply(message, "That's me!");
});

controller.hears(['pacman'], ['ambient'], function(whichBot, message) {
	whichBot.reply(message, "Run away!!");
});

// post message to different channel
controller.hears(['post to clyde'], ['direct_message'], (bot, message)=>{
	var postMsg = {
		channel: 'C1HC4RN1H', 		// channel id - req
		text: 'blah',
		attachments: [
			{
				'title': 'post to bot-test-clyde',
				'text': 'some text in here.',
				'color': 'good',
				//'image_url': hangmanConfig.winImage, // win image
				"mrkdwn_in": ["text", 'title', "pretext", 'fields', 'value']
			}
		]
	}
	bot.api.chat.postMessage(postMsg);
});



// Open the doors
controller.hears(['open the (.*) doors'],['ambient'],function(bot,message) {
	//match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
	var doorType = message.match[1];
	// canned responses
	var response = ['Do it yourself', 'Sure, why not', 'Open sesame...'];

	if (doorType === 'pod bay') {
		// if true, return this message and stop executing chain
		return bot.reply(message, 'I\'m sorry, Dave. I\'m afraid I can\'t do that.');
	} 
	else if (doorType === 'blue') {
		return bot.reply(message, {
			'attachments': [
				{
					text:'It\'s bigger on the inside??',
					image_url: 'https://s-media-cache-ak0.pinimg.com/236x/99/b3/53/99b3539ad6802feee85e19bb13af08ae.jpg'
				}
			]
		});
	} 
	// if none of the above are true retur this
	return bot.reply(message, response[randomNumber(response.length)] );
});

// early tests
/*
controller.on('ambient',function(bot,message) {
		bot.reply(message, {
			text: "A more complex response",
			username: "ReplyBot",
			icon_emoji: ":dash:",
		});
});
*/

/*
controller.hears(['hd'], ['mention'], function(bot, message){
	bot.reply(message, {
		text: "New and improved!",
		username: 'HD Clyde',
		icon_emoji: ":ghost:",
	});
});
*/

// What's the date
controller.hears(['what is the date'], ['ambient'], function(bot, message){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	var showDate = (dd + ' / ' + mm + ' / ' + yyyy).toString();
	bot.reply(message, showDate);
});


// What's the day
controller.hears(['what day is it'], ['ambient'], function(bot, message){
	var d = new Date();
	var n = d.getDay();
	var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ]
	bot.reply(message, days[(n-1)]);

});


/* // complex replies with different fields all stored in an abject with array of attachments
controller.on('direct_message,direct_mention', function(bot,message) {
	var reply_with_attachments = {
		'username': 'My bot' ,
		'text': 'This is a pre-text',
		'attachments': [
			{
				'fallback': 'To be useful, I need you to invite me in a channel.',
				'title': 'How can I help you?',
				'text': 'To be useful, I need you to invite me in a channel ',
				'color': '#7CD197',
				'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png'
			}
		],
		'icon_url': 'http://lorempixel.com/48/48'
		}
	bot.reply(message, reply_with_attachments);
});
*/

// jess bot - jQuery
controller.hears(['jquery'], ['ambient'], function(bot, message){
	bot.reply(message, {
		text: "jQuery is awesome!",
		username: 'jess-bot',
		icon_url: "https://pbs.twimg.com/profile_images/535601713659400193/bu3qboL9.png",
	});
});

// Answer to the ultimate question
controller.hears(['ultimate question'], ['direct_mention'], function(bot, message){
	var meaning = 42;
	var response = {
		text: 'I\'ll take this one @clydebot. The answer to the ultimate question of Life, the Universe and Everything is... ' +(meaning.toString()),
		icon_url: 'https://donhillson.files.wordpress.com/2012/04/deep_thought.png',
		username: 'deep-thought'
	};
	return bot.reply(message, response )
})


/* // random message on user typing
controller.on( 'user_typing', function(bot, message){
	var response = [
		'Yes?',
		'i\'m waiting',
		'type quicker',
		'tick tock',
		'Would you like to hear a joke while we wait?',
		'This must be a very long message',
		'That\'s very interesting',
		'i see your point'
	]
	var responseNew = function(){
		var r = randomNumber(10)
		if (r>5){
			return response[randomNumber((response.length))]
		} 
	}
	bot.reply(message, responseNew() )
} );
*/


// list of users in js1syd
controller.hears(['user list'], ['ambient'], function(bot, message){
	bot.api.users.list({},function(err,response) {
		if (err) {
			bot.botkit.log('something went wrong', err);
		}
		var userList = [];
		var l = response.members.length;
		bot.botkit.log('number of users:', l);
		var numberofUsers = 'number of users' + (l.toString())
		bot.reply(message, numberofUsers );
		for(var i=0; i<=l; i++){
			if(i===l){
				var output = userList.join('\n');
				bot.reply(message, output);
			} else {
				var userName = response.members[i].name
				userList.push(userName);
				bot.botkit.log('user name:', userName);
				//bot.reply(message, userName );
			}	
		}
	})
});


var p = {
		test: 'blah'
	};
function getHumanUsersPresence(id, results){
	bot.api.users.getPresence({'user': id}, function(err, response){
		if (response.presence == 'active'){
			p[id] = response.presence
		}
		//bot.botkit.log('presence: ', results)
	})
}

// human users
controller.hears('get human users', 'direct_message', function(bot, message){
	
	
	bot.api.users.list({},function(err,response) {
		if (err) {bot.botkit.log('something went wrong', err)};

		//bot.botkit.log('slackbot:   ', response.members[(response.members.length)-1] );
		var output = [];
		
		for (var i=0; i<response.members.length; i++){
			
			if (!response.members[i].is_bot && response.members[i].name !== 'slackbot'){
				var humanUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
				//bot.botkit.log('user:   ', humanUser );
				//bot.botkit.log( response.members[i].id );
				var testId = response.members[i].id
				/*bot.api.users.getPresence({'user': testId}, function(err, response){
					bot.botkit.log('presence is: ', response.presence)
				})*/
				getHumanUsersPresence(testId, p)


				//bot.botkit.log( user.list.user[response.members[i].id] )
				output.push(humanUser)
			}
		}
		
		//bot.botkit.log(k);	
		//bot.reply(message, output.join('\n'));
	});

});

controller.hears('show online users', 'direct_message', function(bot, message){
	let k = Object.keys(p);
	bot.botkit.log(k);	
})



/*
// testing users to the bot.log in terminal
	bot.api.users.list({},function(err,response) {
		if (err) {
			bot.botkit.log('something went wrong', err);
		}
		//bot.botkit.log('mystery user:   ', response.members[3] );
		//bot.botkit.log('slackbot:   ', response.members[(response.members.length)-1] );
		var output = [];
		for (var i=0; i<response.members.length; i++){
			if ((response.members[i].is_bot || response.members[i].name === 'slackbot') && response.members[i].deleted !== true){
				var botUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
				//bot.botkit.log('user:   ', i, botUser );
				output.push(botUser)
			}
		}
	})
*/

// bot users
controller.hears('bot users', 'ambient', function(bot, message){
	bot.api.users.list({},function(err,response) {
		if (err) {
			bot.botkit.log('something went wrong', err);
		}
		bot.botkit.log('slackbot:   ', response.members[(response.members.length)-1] );
		var output = [];
		for (var i=0; i<response.members.length; i++){
			if ( (response.members[i].is_bot || response.members[i].name === 'slackbot') && response.members[i].deleted !== true){
				var botUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
				bot.botkit.log('user:   ', i, response.members[i].id );
				output.push( i + '\t' + botUser)
			}
		}
		bot.reply(message, output.join('\n'));
	})
})




// ask who a bot is
controller.hears('who is bot (.*)', 'ambient', function(bot, message){
	var botNo = message.match[1]
	bot.botkit.log(botNo);
	bot.api.users.list({},function(err,response) {
		if (err) {
			bot.botkit.log('something went wrong', err);
		}
		var output = 'deleted: ' + (response.members[botNo].name).toString()
		bot.reply(message, output );
	})
})







// random emoji
controller.hears('random emoji', 'ambient', function(bot, message){
	bot.api.emoji.list({}, function(err, response){
		if (err) {
			bot.botkit.log('something went wrong', err)
		}
		var emojiKeys = Object.keys(response.emoji)
		var emojiLength = emojiKeys.length
		bot.botkit.log('emoji:', (response.emoji[emojiKeys[randomNumber(emojiLength)-1]]) )
		var rE = emojiKeys[randomNumber(emojiLength)-1]
		var randomEmoji = response.emoji[rE];
		var output = {
			'attachments': [
				{
					'title': 'Your random emoji is',
					'text': rE,
					'image_url': randomEmoji
				}
			]
		}
		bot.reply(message, output)
	});
})






// repalce this with a factory function -- some day
var userIDs = {};

// make a list of all users
function makeUserList(){
	bot.api.users.list({}, function(err, response){
		for(var i=0; i<response.members.length; i++){
			userIDs[response.members[i].name] = response.members[i].id	
		}
		//bot.botkit.log(' user', userIDs)
	});
};
makeUserList();



var missingpersons = 0;
controller.hears('user (.*)', ['ambient', 'direct_message'], function(bot, message){
	var queryName = message.match[1] // user name
	var onlineStatus = '--';
	var queryId = {
		'users': userIDs[queryName]
	}
	//bot.botkit.log('----asking about: ', queryName, queryId);
	var onlineQuery = {
		'user': userIDs[queryName]
	}
	bot.api.users.getPresence(onlineQuery ,function(errOnline,responseOnline) {
		//bot.botkit.log(responseOnline.presence);
		onlineStatus = responseOnline.presence
	})

	if ( queryId.users !== undefined){
		missingpersons = 0;
		bot.api.users.list({},function(err,response) {
			if (err) {bot.botkit.log('something went wrong', err);}
			
			for(var i=0; i<response.members.length; i++){
				if ( response.members[i].id === queryId.users ){
					var userImage = {
						'attachments': [
							{
								'title': 'They\'re real name is \`' + response.members[i].real_name + '\` \n\`' + response.members[i].profile.title + '\`',
								'text': response.members[i].profile.first_name + ' is currently ' + onlineStatus,
								'image_url': response.members[i].profile.image_512
							}
						]
					}
					bot.reply(message,userImage);
				}
			}	
		});

	} else {
		if (missingpersons === 1){
			bot.reply(message, 'Sorry, no one here by that name' );
			missingpersons = 0;
		} else {
			bot.reply(message, 'Huh? I wasn\'t paying attention, can you repeat that?' );
			makeUserList();
			missingpersons=1;
		}
	}
})



/*  This is all wrong

IDEA: To get list of online users: 
	1. run function on user.list and push all users IDs and names into arrays
	2. use controller.hears to then run users.presence with user ids
	3. if returns active (?) use that index to push name and status to new array.
	4. print results of online array




	var userIDs = [];
	var count= 0;
	var output = [];

	bot.api.users.list({},function(err,response) {
		
		var count =(response.members.length)
		
		//bot.botkit.log(output);
		//console.log('count', count);
		var onlineUsers = [];

		for(var i=0; i<38; i++){
			//console.log(userIDs[i]);
			var g = {
				'user': userIDs[i]
			}

			bot.api.users.getPresence(g,function(err2,response2) {

				for (var j=0; j<response.members.length; j++){
					//var userID = response.members[i].id

					if (!response.members[j].is_bot && response.members[j].name !== 'slackbot'){
						userIDs.push(response.members[j].id);
						//bot.botkit.log(isOnline(response.members[i].id));
						
						var humanUser = response.members[j].profile.first_name + ' ' + response.members[j].profile.last_name ;
						output.push(humanUser);
						//bot.botkit.log('user:   ', humanUser );
					};
					
				}


				bot.botkit.log('online???',i-1, output[i-1], response2.presence)
				onlineUsers.push(response2.presence)
				//bot.botkit.log('--online----', response2.presence);	
			});

		}
		bot.botkit.log('xxxxx', onlineUsers)
	})


*/


bot.botkit.log('bot started')

// conversation test
controller.hears('pizzatime', 'direct_message', function(bot,message) {
	bot.botkit.log('pizza started');

	askFlavor = function(response, convo) {
	  convo.ask('What flavor of pizza do you want?', function(response, convo) {
		//var k = JSON.stringify(convo);
		//bot.botkit.log(k);

		if(response.text === 'pineapple' ){ 
			convo.say('No way, that\'s nasty.');
			convo.next();
		} else {
			convo.say('Nice.');
			askSize(response, convo);
			convo.next();
		}   

	  });
	}
	askSize = function(response, convo) {
	  convo.ask('Do you want a small, medium or large', function(response, convo) {
		if(response.text === 'small'){
			convo.say(response.text + ' it is');
			askWhereDeliver(response, convo);
			convo.next();
		} else if (response.text === 'medium'){
			convo.say( response.text + ' good call');
			askWhereDeliver(response, convo);
			convo.next();
		} else if (response.text === 'large'){
			convo.say('bit of an appetite have we?');
			askWhereDeliver(response, convo);
			convo.next();
		} else {
			convo.say('Can you repeat that?');
			askSize(response, convo);
			convo.next();
		}

		//convo.say('Ok.')
	   // askWhereDeliver(response, convo);
	   // convo.next();
	  });
	}
	askWhereDeliver = function(response, convo) {
	  convo.ask('So where do you want it delivered?', function(response, convo) {
		convo.say('Done, pizza on it\'s way to ' + response.text);
		convo.next();
	  });
	}

	bot.startConversation(message, askFlavor);
});


// prefix and csv for keywords to match against
// if 'keyword' and one of the csv are matched perfirm function
// else do nothing
controller.hears(['keyword','^fish$, ^dragon$'],['direct_message'],function(bot,message) {
  // do something to respond to message
  bot.reply(message,'You used a keyword!');

});


var keyPhrases = [
	'Stark', 'Lanister', 'Greyjoy', 'Bolton'
]
controller.hears([keyPhrases],['direct_message'],function(bot,message) {
	//bot.botkit.log(message);
  // do something to respond to message
  bot.reply(message,'You used a keyword!');
});




//controller.hears('channel info', 'direct_message', function(bot, message){
	bot.api.channels.list({},function(err, response){
		var channelKeys = Object.keys(response);
		//bot.botkit.log('---- channel keys: ', channelKeys.join('\n'))
		//bot.botkit.log('---- channel info', response);
	})
//})


bot.api.channels.info({'channel': 'C0ZSX0Z9N'},function(err, response){
		//var channelKeys = JSON.stringify(response);
		//bot.botkit.log('---- channel keys: ', channelKeys)
		//bot.botkit.log('---- channel info', response);
	})


// use count to control the number of history entries to wrok through
bot.api.channels.history({'channel': 'C0ZSX0Z9N', 'count': 1},function(err, response){
		//var channelKeys = JSON.stringify(response);
		//bot.botkit.log('---- channel keys: ', channelKeys)
//	bot.botkit.log('---- channel info' + response.messages[0].text +' posted by user: ' + response.messages[0].user)
})


bot.api.im.history({'channel': 'D1J7GEA6A', 'count': 1},function(err, response){
		//var channelKeys = JSON.stringify(response);
		//bot.botkit.log('---- channel keys: ', channelKeys)
//	bot.botkit.log('---- channel info' + response.messages[0].text +' posted by user: ' + response.messages[0].user)
});


controller.hears('we need to talk', 'mention', function(bot, message){
	bot.api.im.open({'user': 'U16MQAW1L'}, function(err, response){
		bot.botkit.log('---- chat open');
		bot.api.chat.postMessage({'channel': 'U16MQAW1L', 'text': 'Hello', 'as_user': 'U1HDDKWCD'})
	})
});


// exploring the information inside asent message
controller.hears('say my name', 'direct_message', function(bot, message){
	var messageKeys = Object.keys(message);
	bot.botkit.log('---- message keys:', messageKeys );

	messageKeys.forEach(function(key, i){
		bot.botkit.log('---- key', i, key, message[key])
	})
	bot.botkit.log('---- user ', message.user);
	bot.reply(message, 'Your id is: ' + message.user.name)
})





controller.hears(['hello', 'hi'], 'direct_message', function(bot, message) {

	bot.api.reactions.add({
		timestamp: message.ts,
		channel: message.channel,
		name: 'robot_face',
	}, function(err, res) {
		if (err) {
			bot.botkit.log('Failed to add emoji reaction :(', err);
		}
	});


	controller.storage.users.get(message.user, function(err, user) {
		if (user && user.name) {
			bot.reply(message, 'Hello ' + user.name + '!!');
		} else {
			bot.reply(message, 'Hello. :squirrel:');
		}
	});
});






// changing user name only while bot is running
controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message', function(bot, message) {
	var name = message.match[1];
	controller.storage.users.get(message.user, function(err, user) {
		if (!user) {
			user = {
				id: message.user,
			};
		}
		user.name = name;
		controller.storage.users.save(user, function(err, id) {
			bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
		});
	});
});


//create new channel
controller.hears('create channel called', 'direct_message', function(bot, message){
	bot.api.channels.create({'name': 'newTest'}, function(err, response){
		bot.botkit.log(err)
	});
	bot.botkit.log('done')
})

