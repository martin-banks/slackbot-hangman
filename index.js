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


/*

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

/*
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


// human users
controller.hears('human users', 'ambient', function(bot, message){
	bot.api.users.list({},function(err,response) {
		if (err) {
			bot.botkit.log('something went wrong', err);
		}
		bot.botkit.log('slackbot:   ', response.members[(response.members.length)-1] );
		var output = [];
		for (var i=0; i<response.members.length; i++){
			if (!response.members[i].is_bot && response.members[i].name!== 'slackbot'){
				var humanUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
				bot.botkit.log('user:   ', humanUser );
				output.push(humanUser)
			}
		}
		bot.reply(message, output.join('\n'));
	})
})



	bot.api.users.list({},function(err,response) {
		if (err) {
			bot.botkit.log('something went wrong', err);
		}
		bot.botkit.log('mystery user:   ', response.members[3] );
		bot.botkit.log('slackbot:   ', response.members[(response.members.length)-1] );
		var output = [];
		for (var i=0; i<response.members.length; i++){
			if ((response.members[i].is_bot || response.members[i].name === 'slackbot') && response.members[i].deleted !== true){
				var botUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
				bot.botkit.log('user:   ', i, botUser );
				output.push(botUser)
			}
		}
	})


// bot users
controller.hears('bot users', 'ambient', function(bot, message){
	bot.api.users.list({},function(err,response) {
		if (err) {
			bot.botkit.log('something went wrong', err);
		}
		bot.botkit.log('slackbot:   ', response.members[(response.members.length)-1] );
		var output = [];
		for (var i=0; i<response.members.length; i++){
			if (response.members[i].is_bot || response.members[i].name === 'slackbot' && !response.members[i].deleted){
				var botUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
				bot.botkit.log('user:   ', i, botUser );
				output.push(botUser)
			}
		}
		bot.reply(message, output.join('\n'));
	})
})

// online users
bot.api.users.getPresence({},function(err,response) {
	if (err) {
		bot.botkit.log('something went wrong', err);
	}
	bot.botkit.log('\tonline:', response);
	
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



////////////////////////////////////////////////////////////////////////////////
// list of controlls
controller.hears(['what can you do'],['mention'], function(bot, message){
	var botCommands = {
		'text': 'This is what I do so far...',
		'attachments': [
			{
				'title': 'jess-bot',
				'text': 'Any mention of the "jQuery" will prompt jess-bot to let you what it thinks',
			},
			{
				'title': 'Ask "what day is it?"',
				'text': 'Clyde will tell you waht the day is'
			},
			{
				'title': 'Ask "what is the date"',
				'text': 'Clyde will tell you waht the date is'
			},
			{
				'title': 'Ask "Open the ---- doors"',
				'text': 'Clyde may or may not help depending what type of door you ask him to open'
			}, 
			{
				'title': '"@clydebot: what is the answer to the ultimate question"',
				'text': 'You know what comes next... \n use toString() on a previously created varible to return a number (as a string) into the chat'
			},
			{
				'title': 'While you\'re typing -- REMOVED',
				'text': 'Randomly return a random message while user types'
			},
			{
				'title': 'Get all user names',
				'text': 'tpye "user list" to list all users and bots in js1syd'
			},
			{
				'title': 'Get all human users real names',
				'text': 'tpye "human users" to list all users in js1syd'
			},
			{
				'title': 'Get all bot users real names',
				'text': 'tpye "bot users" to list all bots in js1syd'
			},
			{
				'title': 'Random emoji',
				'text': 'Display a random emoji character'
			}
		]
	}
	return bot.reply(message, botCommands)
});