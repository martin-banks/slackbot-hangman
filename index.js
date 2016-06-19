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


// human users
controller.hears('human users', 'ambient', function(bot, message){

	bot.api.users.list({},function(err,response) {
		if (err) {bot.botkit.log('something went wrong', err)};

		//bot.botkit.log('slackbot:   ', response.members[(response.members.length)-1] );
		var output = [];
		for (var i=0; i<response.members.length; i++){
			if (!response.members[i].is_bot && response.members[i].name !== 'slackbot'){
				var humanUser = response.members[i].profile.first_name + ' ' + response.members[i].profile.last_name
				//bot.botkit.log('user:   ', humanUser );
				output.push(humanUser)
			}
		}
		bot.reply(message, output.join('\n'));
	})
});





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
				bot.botkit.log('user:   ', i, botUser );
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
controller.hears('user (.*)', 'ambient', function(bot, message){
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
								'title': 'They\'re real name is \`' + response.members[i].real_name + '\` and claim to be a \`' + response.members[i].profile.title + '\`',
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
controller.hears(['what can you do'],['mention'], function(bot, message){
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

