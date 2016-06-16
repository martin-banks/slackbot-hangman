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
  return bot.reply(message, z );

});



controller.on('ambient',function(bot,message) {

    // do something...

    // then respond with a message object
    //
    bot.reply(message,{
      text: "A more complex response",
      username: "ReplyBot",
      icon_emoji: ":dash:",
    });

});


controller.hears(['hd'], ['mention'], function(bot, message){
	
	bot.reply(message, {
		text: "New and improved!",
		username: 'HD Clyde',
		icon_emoji: ":ghost:",
	});

});