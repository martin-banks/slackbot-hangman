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
	return (Math.floor(Math.random()*param))+1
}


controller.hears(['hello'], ['mention'], function(whichBot, message) {
	whichBot.reply(message, "That's me!");
});

controller.hears(['pacman'], ['ambient'], function(whichBot, message) {
	whichBot.reply(message, "Run away!!");
});




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

		// do something...

		// then respond with a message object
		//
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


controller.hears(['what is the date'], ['ambient'], function(bot, message){
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	var showDate = (dd + ' / ' + mm + ' / ' + yyyy).toString();
	bot.reply(message, showDate);

});



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


controller.hears(['jquery'], ['ambient'], function(bot, message){
	
	bot.reply(message, {
		text: "jQuery is awesome!",
		username: 'jess-bot',
		icon_url: "https://pbs.twimg.com/profile_images/535601713659400193/bu3qboL9.png",
	});
});

controller.hears(['ultimate question'], ['direct_mention'], function(bot, message){
	var meaning = 42;
	var response = {
		text: 'I\'ll take this one @clydebot. The answer to the ultimate question of Life, the Universe and Everything is... ' +(meaning.toString()),
		icon_url: 'https://donhillson.files.wordpress.com/2012/04/deep_thought.png',
		username: 'deep-thought'
	};
	return bot.reply(message, response )
})



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
			}
			

		]
	}
	return bot.reply(message, botCommands)

})