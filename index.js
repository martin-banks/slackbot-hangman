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





var randomNumber = function(param){
	return (Math.floor(Math.random()*param))
}


controller.hears(['hello'], ['mention'], function(whichBot, message) {
	whichBot.reply(message, "That's me!");
});

controller.hears(['pacman'], ['ambient'], function(whichBot, message) {
	whichBot.reply(message, "Run away!!");
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





//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
// HANGMAN BOT ///////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
var botLog = (param)=>{
	console.log("\x1b[33m", param, "\x1b[0m")
}
var r = function(min, max){
	return min + (Math.floor(Math.random()*max))
};

var hangmanConfig = {
	words: [
		'tree',
		'beach',
		'sea',
		'factory'
	],

}
var words = [
	'tree',
	'beach',
	'sea',
	'factory'
];
words = words.map( (v,i,a) => {
	return v.toUpperCase();
});
//botLog(words);




// start hangman game
controller.hears('play hangman', 'direct_message', (bot, message)=>{
	//function startTimer(c){
		
	//}
	// set up
	var mKeys = Object.keys(message);
	bot.botkit.log(mKeys);
	var playerName;

	var puzzleWord = [];
	var puzzleView = [];
	var wrongGuessCount= 5;
	var guessLetter;
	var answer = (puzzleView.toString().replace(/,/g, ''));
	var gameInPlay = false;
	var userGuesses = [];
	var alphabet = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	/*
	alphabet = alphabet.map((v,i,a)=>{
		return '*' + v + '*'
	});
	*/
	//botLog(alphabet);

	var messageColours = {
		correct: '',
		wrong: '',
		neutral: ''
	} 
	// available as parto slack markup: good, warning, danger
	// neutral applie when config set

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
		botLog('time: ' + (t/10) + ' seconds')
	}



	// get oline users
	var onlineUserList = ['test'];
	
	/*function getHumanUsersPresence(id){
		bot.api.users.getPresence({'user': id}, function(err, response){
			if (response.presence == 'active'){
				onlineUserList[id] = response.presence
			}
		})
	};*/

	function getHumanUsersPresence(id){
		bot.api.users.getPresence({'user': id}, function(err, response){
			if (response.presence == 'active'){
				onlineUserList.push(id)
			}
		})
	};

	function pushUserNames(id, userName){
		bot.api.users.getPresence({'user': id}, function(err, response){
			if (response.presence == 'active'){
				onlineUserList.push(userName);
				botLog('id: ' + userName)
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
				
				if (!response.members[i].is_bot && response.members[i].name !== 'slackbot'){
					//var humanUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
					var id = response.members[i].id;
					var userName = response.members[i].name;
					pushUserNames(id, userName)
				}
				/*if ( i === (response.members.length)-1 ){
					setTimeout(function(){
						let k = Object.keys(onlineUserList);
						bot.botkit.log(onlineUserList);	
						return onlineUserList
					},500)
				}*/
			} // end for loop
		}); // end api call
	} // end function	


	








	bot.api.users.info({'user': message.user}, (err, response)=>{
		botLog(response.user.name);
		playerName = response.user.name;

		// check user is allowed to play
		if (playerName === 'martin' && !gameInPlay) {
			// if user allowed to play
			gameInPlay = true;
			startGameTimer();

			botLog('game on');

			// quiz setup
			var chooseWord = words[r(0, words.length)]
			botLog(chooseWord);

			for (var i=0; i<chooseWord.length; i++){
				puzzleWord.push(chooseWord[i]);
			}

			botLog(puzzleWord);
			for(var i=0; i<puzzleWord.length; i++){
				puzzleView.push('—');
			};
			botLog(puzzleView);
			bot.startConversation(message, askLetter);
		} else {
			botLog('Access denied.\nGame not started');
			gameInPlay = false;
		}
	})
	
	// bot asks for letter / start convo
	askLetter = function(response, convo) {
		let reply = {
			//'text': 'correct!, you have these letters left',
			'attachments': [
				{
					'title': puzzleView.join('  ') ,
					'text': 'Pick a letter...',
					//'color': 'danger',
					//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
					"mrkdwn_in": ["text", 'title', "pretext"]
				}
			]
		}
		convo.ask(reply , function(response, convo) {
			guessLetter = (response.text).toUpperCase();
			var filterGuesses = userGuesses.filter( (v,i,a)=>{
				return guessLetter === v
			});
			botLog( ('filtered guesses: '+ filterGuesses + ', length: ' + filterGuesses.length) )

			// compare guess letter to previous letter useage
			// -- change to filer/map?
			if( filterGuesses.length === 0 && response.text.toUpperCase() !== puzzleWord.toString().replace(/,/g, '') ){
				for ( var i=0; i<alphabet.length; i++ ){
					if ( guessLetter === alphabet[i]) {
						alphabet[i] = ' ';
						userGuesses.push(guessLetter);
					} 
				}
			}

			var status = false;
			botLog(('playing: ' + guessLetter))
			answer = (puzzleView.toString().replace(/,/g, ''));

			// check letter against each letter in puzzle, update puzzleView with letter guessed
			for(let i = 0; i<(puzzleWord.length); i++){
				if(guessLetter === puzzleWord[i] && filterGuesses.length === 0 && response.text.toUpperCase() !== puzzleWord.toString().replace(/,/g, '')){ 
					status = true;
					puzzleView[i] = guessLetter; 
					botLog(puzzleView);
					// nextConvoName(response, convo)
					// convo.say('');
					// convo.next();
				} 
			}
			botLog(answer, status)


			// actions to take 
			if(response.text === 'quit'){
				stopGameTimer();
				let reply = {
					//'text': 'correct!, you have these letters left',
					'attachments': [
						{
							'title': 'Quitting...',
							//'text': '',
							'color': 'danger',
							//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
							"mrkdwn_in": ["text", 'title', "pretext"]
						}
					]
				}
				convo.say(reply)
				quitGame(response, convo);
				convo.next;
			} 
			else if (response.text === 'play hangman'){
				convo.say('you\'re already playing!')
			}
			// guess whole word
			else if (response.text.toUpperCase() === puzzleWord.toString().replace(/,/g, '') ){
				botLog(response.text)
				botLog('full answer correct' + puzzleWord.toString().replace(/,/g, '') );
				stopGameTimer();
				getHumanUsers()
				let reply = {
					//'text': 'correct!, you have these letters left',
					'attachments': [
						{
							'title': 'Winner!',
							'text': 'The word was: \_' + puzzleWord.toString().replace(/,/g, '') + '\_',
							"fields": [
				                {
				                    "title": "You got it in" ,
				                    "value": (t/10) + ' seconds',
				                    "short": true
				                },
				                 {
				                    "title": "Challenge mode" ,
				                    "value": 'Do you want to see who is online now?',
				                    "short": true
				                }
				            ],
							'color': 'good',
							//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
							"mrkdwn_in": ["text", 'title', "pretext"]
						}
					]
				};
				convo.say(reply);
				asktoChallenge(response, convo);
				convo.next();
			}
			else if (answer === puzzleWord.toString().replace(/,/g, '') ) {
				botLog('got right letters');
				stopGameTimer();

				botLog( 'winner!');
				let reply = {
					//'text': 'correct!, you have these letters left',
					'attachments': [
						{
							'title': 'Winner!',
							'text': 'The word was: \_' + puzzleWord.toString().replace(/,/g, '') + '\_',
							"fields": [
				                {
				                    "title": "You got it in" ,
				                    "value": (t/10) + ' seconds',
				                    "short": true
				                }
				            ],
							'color': 'good',
							//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
							"mrkdwn_in": ["text", 'title', "pretext"]
						}
					]
				}
				convo.say(reply);
				challenge(response, convo);
				convo.next();
			} 
			else if ( status && filterGuesses.length ===0) {
				botLog( 'correct!, guess again');
				let reply = {
					//'text': 'correct!, you have these letters left',
					'attachments': [
						{
							'title': 'Correct!',
							'text': '\*You have these letters left:\*\n' + '\`\`\`' + alphabet.join('  ') + '\`\`\`',
							'color': 'good',
							//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
							"mrkdwn_in": ["text", 'title', "pretext"]
						}
					]
				}
			//	convo.say('correct!, you have these letters left');
				convo.say(reply);
				askLetter(response, convo);
				convo.next();
			} 
			else if (wrongGuessCount <= 1){
				stopGameTimer();
				botLog('you lose, game over');
				let reply = {
					//'text': 'correct!, you have these letters left',
					'attachments': [
						{
							'title': 'Game over!',
							'text': 'Better luck next time',
							'color': 'danger',
							//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
							"mrkdwn_in": ["text", 'title', "pretext"]
						}
					]
				}
				convo.say(reply)
				convo.next();
			}
			else if ( filterGuesses.length > 0 ) {
				let reply = {
					//'text': 'correct!, you have these letters left',
					'attachments': [
						{
							'title': 'Oops, already played that one, try again',
							'text': 'You have these letters left:\n' + '\`\`\`' + alphabet.join('  ') + '\`\`\`',
							//'color': 'good',
							//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
							"mrkdwn_in": ["text", 'title', "pretext"]
						}
					]
				};
				convo.say(reply);
				//convo.say('```' + alphabet.join('  ') + '```');
				askLetter(response, convo);
				convo.next();
			}
			else {
				botLog('wrong guess');
				wrongGuessCount-=1;
				let reply = {
					//'text': 'correct!, you have these letters left',
					'attachments': [
						{
							'title': 'Wrong',
							"fields": [
				                {
				                    "title": "Guesses left" ,
				                    "value": wrongGuessCount,
				                    "short": true
				                }
				            ],
							'text': 'You have these letters left:\n' + '\`\`\`' + alphabet.join('  ') + '\`\`\`',
							'color': 'danger',
							//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
							"mrkdwn_in": ["text", 'title', "pretext"]
						}
					]
				}
				//convo.say('wrong guess. you have *' + wrongGuessCount + '* guesses left');
				convo.say(reply);
				askLetter(response, convo);
				convo.next();
			} 

		});
	}
	// challenge someone else
	challenge = function(response, convo) {
		//getHumanUsers();
		botLog('online users from challenge: ' + onlineUserList);
		
		convo.say(onlineUserList);
		convo.next();	
		gameInPlay = false;	
	};

	asktoChallenge = function(response, convo) {
		convo.ask('want to challenge?' , function(response, convo) {
			if(response.text === 'yes'){
				botLog('online users from challenge: ' + onlineUserList.join(', '));
				convo.say('Looking for online users... ' + onlineUserList.join(', ') )
				challenge(response, convo);
				convo.next();
			} 
			else {
				convo.say('thanks for playing');
				convo.next();
			}
		})
		
	}

	quitGame = (response, convo)=>{
		let reply = {
			//'text': 'correct!, you have these letters left',
			'attachments': [
				{
					'title': 'The game has quit',
					'text': 'Start again?',
					//'color': 'good',
					//'image_url': 'http://vignette1.wikia.nocookie.net/pacman/images/2/2b/Clydeeghost.png',
					"mrkdwn_in": ["text", 'title', "pretext"]
				}
			]
		}
		convo.say(reply);
		convo.next();
		gameInPlay = false;
	}

	
});


/*
# To do list

## Priority
- get list of active users
- draw artwork for gallowes
- add gallowes artwork


### in no particular order
- scoreboard ? / store results ?
- include intro for theme of words
- different word groups/themes 
- display a hint if palyer asks for one
- create your own quiz to challenge others / temp storage / factory function
- start game in private chat 
- move into bot-test-clyde channel
- attachment reponse as template function
- all info into single game object 
- conditional for timer to show minutes and seconds


## in prgress
- put all messages in as attachements

## Done
- display timer in results
- check whole word for answer 



*/