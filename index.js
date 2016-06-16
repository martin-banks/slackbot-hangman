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



var r = function(){
	return (Math.floor(Math.random()*10))+1
}


controller.hears(['hello'], ['mention'], function(whichBot, message) {
  whichBot.reply(message, "That's me!");
});

controller.hears(['pacman'], ['ambient'], function(whichBot, message) {
  whichBot.reply(message, "Run away!!");
});



// doesn't like js random number?
var randomNumber = 0+1;


controller.hears(['open the (.*) doors'],['ambient'],function(bot,message) {
  //match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
  var doorType = message.match[1];

  var okay = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  var z = r();

  if (doorType === 'pod bay') {
    return bot.reply(message, 'I\'m sorry, Dave. I\'m afraid I can\'t do that.');
  }
  return bot.reply(message, okay[r()] );

});



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




controller.hears(['jquery'], ['ambient'], function(bot, message){
	
	bot.reply(message, {
		text: "jQuery is awesome!",
		username: 'Jess-Bot',
		icon_url: "https://pbs.twimg.com/profile_images/535601713659400193/bu3qboL9.png",
	});
});


