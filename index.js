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
bot.startRTM( (error, whichBot, payload)=> {
	if (error) {
		throw new Error('Could not connect to Slack');
	}
});

// helper functions
// colour coded console logs for easier reading
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
// random number generator
var r = (min, max)=> {
	return min + (Math.floor(Math.random()*max))
};
// log if bot has started
safeLog('bot start')

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// HANGMAN BOT ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
var hangmanConfig = {
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
		status: false,
		users: [ 'amysimmons', 'martin', 'jess'],
		title: "Access denied",
		text: 'This game is still in development, you do not have access to play yet.'
	},
	users: {}
};

// convert game words to uppercase
hangmanConfig.javascript.words = hangmanConfig.javascript.words.map( (v,i,a) => {
	return v.toUpperCase();
});

// command to start a game
var startGameCommand = 'play hangman';

// start hangman game
controller.hears( startGameCommand, 'direct_message', (bot, message)=>{
	// create/reset config object keys for user
	hangmanConfig.users[message.user] = {};
	hangmanConfig.users[message.user].userGuesses = [];
	hangmanConfig.users[message.user].wrongGuessCount = 0;
	hangmanConfig.users[message.user].puzzleView = [];
	var puzzleView = hangmanConfig.users[message.user].puzzleView = [];

	// set up
	var mKeys = Object.keys(message);
	bot.botkit.log(mKeys);
	var playerName;
	var answer = (puzzleView)=>{
		return (puzzleView.toString().replace(/,/g, ''));
	}
	var gameInPlay = false;
	var alphabet = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	hangmanConfig.users[message.user].alphabet = alphabet;
	var chooseWord = ()=>{
		return (hangmanConfig.javascript.words[r(0, hangmanConfig.javascript.words.length)])
	}
	var markDownFields = ["text", "pretext", 'fields', 'value'];

	var remainingLetters = ()=>{
		return	`
		\*You have these letters left:\*\n 
		\`\`\` ${hangmanConfig.users[message.user].alphabet.join('  ')} \`\`\`
		`
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
		bot.api.users.getPresence({'user': id}, (err, response)=> {
			if (response.presence == 'active'){
				onlineUserList.push(id)
			}
		})
	};
	function pushUserNames(id, userName){
		bot.api.users.getPresence({'user': id}, (err, response)=> {
			if (response.presence == 'active'){
				onlineUserList.push(userName);
				botLog('id: ' + userName);
			}	
		})
	}
	// get human users	
	function getHumanUsers(){
		bot.api.users.list({},(err,response)=> {
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
					'as_user': 'U1HDDKWCD', // not working ??
					'username': 'U1HDDKWCD',		
					'icon_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
					"mrkdwn_in": markDownFields
				}
			]
		}
		bot.api.chat.postMessage(postMsg);
	};

	// api call to get current user information
	bot.api.users.info({'user': message.user}, (err, response)=>{
		botLog(response.user.name);
		playerName = response.user.name;

		// set up a new game
		function setUpGame(){
			startGameTimer();
			safeLog('game on');
			
			// update config object
			hangmanConfig.users[message.user].currentWord = chooseWord();
			hangmanConfig.users[message.user].gameInPlay = true;
			// update variables
			var chosenWord = hangmanConfig.users[message.user].currentWord;
			gameInPlay = hangmanConfig.users[message.user].gameInPlay;

			botLog(`chosenWord = ${chosenWord}`);
			for(var i=0; i<chosenWord.length; i++){
				hangmanConfig.users[message.user].puzzleView.push('—');
			};
			botLog(`puzzleview: ${hangmanConfig.users[message.user].puzzleview}`);
			// update puzzle view
			puzzleview = hangmanConfig.users[message.user].puzzleview;
			// start quiz convo
			bot.startConversation(message, showIntro);
		}

		// if accessed is denied to the player
		function accessedDenied(){
			dangerLog('Access denied. | Game not started');
			gameInPlay = false;
			bot.startConversation(message, showAccessDenied);
		}

		// check if there are restristions. 
		// if true, check username against list of those allowed to play
		if( hangmanConfig.restrictedAccess.status === true ){
			for(let i = 0; i < hangmanConfig.restrictedAccess.users.length; i++ ){
				if ( playerName === hangmanConfig.restrictedAccess.users[i] && !gameInPlay ){
					setUpGame();
					warnLog('restricted true and allowed');
					return false
				} else if (i === (hangmanConfig.restrictedAccess.users.length -1)) {
					accessedDenied();
					warnLog('restricted true and denied');
					return false
				}
			}
		} else if ( hangmanConfig.restrictedAccess.status === false ){
			setUpGame();
			warnLog('restricted false and allowed');
			return false
		} else {
			accessedDenied();
			warnLog('restricted false and denied - something has gone wrong');
			return false;
		}
	}); // end of user verification

	// convo to start game - showing game intro
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

	// convo start if accessed denied
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
	
	// bot asks for letter
	askLetter = (response, convo, puzzleview)=> {
		let reply = {
			'attachments': [
				{
					'title': puzzleView.join('  ') ,
					'text': 'Pick a letter...',
					"mrkdwn_in": markDownFields
				}
			]
		}
		convo.ask(reply , (response, convo)=> {
			botLog(`response keys: ${Object.keys(response)} | ${response.user}`)

			// update config and variables with game information stored for that user
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
			botLog( `filtered guesses: ${filterGuesses}, length: ${filterGuesses.length}` )

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
			botLog( `playing: ${guessLetter}` );
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
			botLog( `answer: ${answer(puzzleview)} | status: ${status}`)

			// actions to take /////////////
			// if user types 'quit' - converted to uppercase to remove any case issues (eg: iOS auto capitalise)
			if(response.text.toUpperCase() === 'QUIT'){
				stopGameTimer();
				let reply = {
					'attachments': [
						{
							'title': 'Quitting...',
							'color': 'warning',
							"mrkdwn_in": markDownFields
						}
					]
				};
				convo.say(reply);
				quitGame(response, convo);
				convo.next();
			} 
			// if user tries to start a new game while another is already in play
			else if (response.text === startGameCommand){
				convo.say('you\'re already playing!');
			}

			// if user guess whole word
			else if (response.text.toUpperCase() === chosenWord ){
				botLog(response.text);
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
									"value": `\_${chosenWord}\_`,
									"short": true
								},
								{
									"title": "You got it in" ,
									"value": `${t} seconds`,
									"short": true
								},
							],
							'color': 'good',
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
				safeLog( 'winner! guessed all correct letters' );
				let reply = {
					'attachments': [
						{
							'title': 'Winner!',
							"fields": [
								{
									"title": "The word was:" ,
									"value": `\_${chosenWord}\_`,
									"short": true
								},
								{
									"title": "You got it in" ,
									"value": `${t} seconds`,
									"short": true
								},
							],
							'color': 'good',
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
				botLog(answer(puzzleview) + " | " + chosenWord );
				let reply = {
					'attachments': [
						{
							'title': 'Correct!',
							'text': remainingLetters(),
							'color': 'good',
							"mrkdwn_in": markDownFields
						}
					]
				};
				convo.say(reply);
				askLetter(response, convo, puzzleview);
				convo.next();				
			}

			// game over - ran out of lives
			else if (wrongGuessCount >= 4){
				hangmanConfig.users[message.user].wrongGuessCount += 1;
				var wrongGuessCount = hangmanConfig.users[message.user].wrongGuessCount;
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
				convo.say(reply);
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
				botLog(hangmanConfig.images[wrongGuessCount]);
				hangmanConfig.users[message.user].wrongGuessCount += 1;
				var wrongGuessCount = hangmanConfig.users[message.user].wrongGuessCount;
				botLog ('wronguesscount ' + wrongGuessCount);
				botLog(hangmanConfig.images[wrongGuessCount]);
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
	}; // end of ask convo

	// challenge someone else
	challenge = (response, convo)=> {
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
	asktoChallenge = (response, convo)=> {
		let askToFuindUsers = {
			'attachments': [
				{
					'text':  "\*Do you want to see who's online now?\* \_(yes / no)\_",
					"mrkdwn_in": markDownFields
				}
			]
		};
		convo.ask( askToFuindUsers, (response, convo)=> {
			if(response.text.toUpperCase() === 'YES' || response.text.toUpperCase() === 'Y'){
				let reply = {
					'attachments': [
						{
							'title':  'Looking for players...'
						}
					]
				};
				botLog('online users: ' + onlineUserList.join(', ') );
				convo.say( reply );
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
# To do list - hangman bot

## Priority
-

### in no particular order
- scoreboard ? / store results ? - need better storage option
- different word groups/themes 
- create your own quiz to challenge others / temp storage / factory function
- start game in private chat from other channels
- move into bot-test-clyde channel
- attachment reponse as template function
- random messages on right/wrong guess
- add timeout to ask to find users to prevent memory leak
- trade life for letter

## in prgress
-

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
- introduce new step for intro before ask for letter
- all info into single game object 
- capture player name in config and store puzzleWord as key/value
- store player results in config object


*/
