const Discord = require('discord.io');
const scraper = require('./scraper');
const token = 'Discord bot token here';

let marks = new Map();
let busy = false;

//setInterval(checkMarks, interval * 60 * 1000);

// Initialize Discord Bot
const bot = new Discord.Client({
    token: token,
    autorun: true
});

bot.on('ready', function (evt) {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command it will listen for messages that will start with `!`
    if (message.substring(0, 1) === '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            case 'checkMarks':
                if(!busy) {
                    bot.sendMessage({
                        to: '592236595256492034',
                        message: "➡️ | **Loading**... | ⬅️\n🎲⚫️⚫️⚫️⚫️⚫️"
                    });
                    checkMarks();
                }
                break;
            case 'listMarks':
                let list = '';
                for (let [k, v] of marks) {
                    list += "**---------"+k.substr(0, 7)+"---------**\n";
                    for(let item of v)
                        list += (item.split('Final Mark')[0]+" \n");
                }
                bot.sendMessage({
                    to: '592236595256492034',
                    message: list.toString()
                });
                break;
        }
    }
});

function checkMarks() {
    console.log("Checking marks");

    busy = true;
    let compare = !(marks.size === 0);
    scraper.getMarks().then(data => {
        if(compare) sendAlert(marks, data);
        //save cache
        marks = data;
        for (let [k, v] of marks)
            v.sort(); //sort them

        busy = false;
    });
}
function sendAlert(oldMap, newMap) {
    let newMarks = [];
    let urlEnd = '';
    for (let [k, v] of newMap) {
        if(!oldMap.has(k) || v.length > oldMap.get(k).length){
            newMarks.push("\n\t\t\t**"+k.substr(0, 7)+"**");
            if(urlEnd === '')
                urlEnd = k.substr(0, 7);
        }
    }

    if(newMarks.length > 0)
        bot.sendMessage({
            to: '592236595256492034',
            message: '@here Marks **out** for classes: ' + newMarks.toString() + "\n Check **your's** at https://apps.ecs.vuw.ac.nz/cgi-bin/studentmarks?course="+urlEnd
        });

    else
        bot.sendMessage({
            to: '592236595256492034',
            message: '**NO NEW MARKS**\nUse **!listMarks** to see which have already been released.'
        });
}

checkMarks();

