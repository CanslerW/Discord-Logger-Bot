const fs = require('fs');
const moment = require('moment');
const fsextra = require('fs-extra');
const request = require('request');
const path = require('path');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setStatus('idle');
});

//채팅 로그
client.on("message", async message => {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var logtext = `[${time}] <${message.author.username}#${message.author.discriminator} (${message.author.id})> (${message.id}) [NEW] : ${message.content}`;
    if (message.channel.type == 'dm') {
        var foldername = `${config.folder}/${date}/DM`;
        var filename = `${message.author.id}.txt`;
    } else {
        var foldername = `${config.folder}/${date}/${message.guild.id}/chat`;
        var filename = `${message.channel.id}.txt`;
    }

    if (message.attachments.first()) {
        if (!message.content) {
            writeLog('chat', foldername, filename, logtext + message.id + "-" + message.attachments.first().name, message.attachments.first().url, message.id, message.attachments.first().name);
        } else {
            writeLog('chat', foldername, filename, logtext + ' (' + message.id + "-" + message.attachments.first().name + ')', message.attachments.first().url, message.id, message.attachments.first().name);
        }
    } else {
        writeLog('chat', foldername, filename, logtext);
    }
});

//채팅 수정 로그
client.on('messageUpdate', function (oldMessage, newMessage) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    if (newMessage.cleanContent != oldMessage.cleanContent) {
        if (newMessage.channel.type == 'dm') {
            var foldername = `${config.folder}/${date}/DM`;
            var filename = `${newMessage.author.id}.txt`;
        } else {
            var foldername = `${config.folder}/${date}/${newMessage.guild.id}/chat`;
            var filename = `${newMessage.channel.id}.txt`;
        }
        var logtext = `[${time}] <${newMessage.author.username}#${newMessage.author.discriminator} (${newMessage.author.id})> (${newMessage.id}) [EDIT] : ${newMessage.content}`;
        writeLog('chat', foldername, filename, logtext);
    }
});

//서버 입장 로그
client.on('guildMemberAdd', (member) => {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${member.guild.id}`;
    var filename = `ServerJoinLeave.txt`;
    var logtext = `[${time}] <${member.user.username}#${member.user.discriminator} (${member.id})> : Server Join`;
    writeLog(null, foldername, filename, logtext);
});

//서버 퇴장 로그
client.on('guildMemberRemove', (member) => {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${member.guild.id}`;
    var filename = `ServerJoinLeave.txt`;
    var logtext = `[${time}] <${member.user.username}#${member.user.discriminator} (${member.id})> : Server Leave`;
    writeLog(null, foldername, filename, logtext);
});

//서버 밴 추가 로그
client.on('guildBanAdd', function (user) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${user.guild.id}`;
    var filename = `ServerKickBan.txt`;
    var logtext = `[${time}] <${user.username}#${user.discriminator} (${user.id})> : Server Ban Add`;
    writeLog(null, foldername, filename, logtext);
});

//서버 밴 제거 로그
client.on('guildBanRemove', function (user) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${user.guild.id}`;
    var filename = `ServerKickBan.txt`;
    var logtext = `[${time}] <${user.username}#${user.discriminator} (${user.id})> : Server Ban Remove`;
    writeLog(null, foldername, filename, logtext);
});

//채널 생성 로그
client.on('channelCreate', function (channel) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var foldername = `${config.folder}/${date}/${channel.guild.id}`;
    var filename = `ServerChannel.txt`;

    if (channel.type == 'text') {
        var channeltype = `Text Channel`;
    } else if (channel.type == 'voice') {
        var channeltype = `Voice Channel`;
    } else if (channel.type == 'category') {
        var channeltype = `Category`;
    }

    var logtext = `[${time}] Create : [${channeltype}] ${channel.name} (${channel.id})`;
    writeLog(null, foldername, filename, logtext);
});

//채널 삭제 로그
client.on('channelDelete', function (channel) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var foldername = `${config.folder}/${date}/${channel.guild.id}`;
    var filename = `ServerChannel.txt`;

    if (channel.type == 'text') {
        var channeltype = `Text Channel`;
    } else if (channel.type == 'voice') {
        var channeltype = `Voice Channel`;
    } else if (channel.type == 'category') {
        var channeltype = `Category`;
    }

    var logtext = `[${time}] Delete : [${channeltype}] ${channel.name} (${channel.id})`;
    writeLog(null, foldername, filename, logtext);
});

//채널 설정 변경 로그
client.on('channelUpdate', function (oldChannel, newChannel) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var foldername = `${config.folder}/${date}/${oldChannel.guild.id}`;
    var filename = `ServerChannel.txt`;

    if (oldChannel.type == 'text') {
        var channeltype = `Text Channel`;
    } else if (oldChannel.type == 'voice') {
        var channeltype = `Voice Channel`;
    } else if (oldChannel.type == 'category') {
        var channeltype = `Category`;
    }

    if (oldChannel.name != newChannel.name) {
        var logtext = `[${time}] Name Edit : [${channeltype}] ${oldChannel.name} => ${newChannel.name} (${newChannel.id})`;
        writeLog(null, foldername, filename, logtext);
    }

    if (!oldChannel.nsfw && newChannel.nsfw) {
        var logtext = `[${time}] NSFW Set On : [${channeltype}] ${newChannel.name} (${newChannel.id})`;
        writeLog(null, foldername, filename, logtext);
    } else if (oldChannel.nsfw && !newChannel.nsfw) {
        var logtext = `[${time}] NSFW Set Off : [${channeltype}] ${newChannel.name} (${newChannel.id})`;
        writeLog(null, foldername, filename, logtext);
    }

    if (newChannel.parentID != oldChannel.parentID) {
        var logtext = `[${time}] Category Change ${newChannel.parent.name} (${newChannel.parentID}) : [${channeltype}] ${newChannel.name} (${newChannel.id})`;
        writeLog(null, foldername, filename, logtext);
    }
});


//이모지 생성 로그
client.on('emojiCreate', function (emoji) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${emoji.guild.id}`;
    var filename = `ServerEmoji.txt`;
    var logtext = `[${time}] Emoji Create : ${emoji.name} (${emoji.id}) (${emoji.url})`;
    writeLog('emoji', foldername, filename, logtext, emoji.url, null, path.basename(`${emoji.url}`));
});

//이모지 삭제 로그
client.on('emojiDelete', function (emoji) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${emoji.guild.id}`;
    var filename = `ServerEmoji.txt`;
    var logtext = `[${time}] Emoji Delete : ${emoji.name} (${emoji.id}) `;
    writeLog(null, foldername, filename, logtext);
});

//이모지 이름 변경 로그
client.on('emojiUpdate', function (oldEmoji, newEmoji) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${oldEmoji.guild.id}`;
    var filename = `ServerEmoji.txt`;
    if (oldEmoji.name != newEmoji.name) {
        var logtext = `[${time}] Emoji Update : ${oldEmoji.name} => ${newEmoji.name} (${oldEmoji.id})`;
        writeLog(null, foldername, filename, logtext);
    }
});

//초대 생성 로그
client.on('inviteCreate', function (invite) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var foldername = `${config.folder}/${date}/${invite.guild.id}`;
    var filename = `ServerInvite.txt`;

    var logtext = `[${time}] <${invite.inviter.username}#${invite.inviter.discriminator} (${invite.inviter.id})> Invite Create : URL ${invite.url} / MaxAge ${invite.maxAge} / MaxUser ${invite.maxUses}`;
    writeLog(null, foldername, filename, logtext);
});

//초대 삭제 로그
client.on('inviteDelete', function (invite) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var foldername = `${config.folder}/${date}/${invite.guild.id}`;
    var filename = `ServerInvite.txt`;

    var logtext = `[${time}] Invite Delete : URL ${invite.url}`;
    writeLog(null, foldername, filename, logtext);
});

//역할 생성 로그
client.on('roleCreate', function (role) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${role.guild.id}`;
    var filename = `ServerRole.txt`;
    var logtext = `[${time}] Role Create : ${role.name} (${role.id}) [Color : ${role.hexColor} (${role.color}) / Permissions : ${role.permissions.toArray(r => `${r}`).join(', ')} / Position : ${role.rawPosition}]`;
    writeLog(null, foldername, filename, logtext);
});

//역할 삭제 로그
client.on('roleDelete', function (role) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${role.guild.id}`;
    var filename = `ServerRole.txt`;
    var logtext = `[${time}] Role Delete : ${role.name} (${role.id})`;
    writeLog(null, foldername, filename, logtext);
});

//역할 수정 로그
client.on('roleUpdate', function (oldrole, newrole) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var foldername = `${config.folder}/${date}/${oldrole.guild.id}`;
    var filename = `ServerRole.txt`;

    if (oldrole.name != newrole.name) {
        var logtext = `[${time}] Role Remane : ${oldrole.name} => ${newrole.name} (${oldrole.id})`;
        writeLog(null, foldername, filename, logtext);
    }

    if (oldrole.hexColor != newrole.hexColor) {
        var logtext = `[${time}] Role Color Change : ${oldrole.hexColor} => ${newrole.hexColor} (${oldrole.id})`;
        writeLog(null, foldername, filename, logtext);
    }

    if (oldrole.permissions != newrole.permissions) {
        var logtext = `[${time}] Role Permissions Change : ${oldrole.permissions.toArray(r => `${r}`).join(', ')} => ${newrole.permissions.toArray(r => `${r}`).join(', ')} (${oldrole.id})`;
        writeLog(null, foldername, filename, logtext);
    }

    if (oldrole.rawPosition != newrole.rawPosition) {
        var logtext = `[${time}] Role Position Change : ${oldrole.rawPosition} => ${newrole.rawPosition} (${oldrole.id})`;
        writeLog(null, foldername, filename, logtext);
    }
});

//입력 로그
client.on('typingStart', function (channel, user) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");
    var foldername = `${config.folder}/${date}/${channel.guild.id}`;
    var filename = `UserTyping.txt`;
    var typingtime = moment().format("HH:mm:ss");
    var logtext = `[${typingtime}] <${user.username}#${user.discriminator} (${user.id})> : Typing Start [at ${channel.name} (${channel.id})]`;
    writeLog(null, foldername, filename, logtext);
});

//보이스 상태 로그
client.on('voiceStateUpdate', (oldState, newState) => {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var oldChannel = oldState.channel;
    var newChannel = newState.channel;

    var filename = `UserVoiceStats.txt`;
    var foldername = `${config.folder}/${date}/${newState.member.guild.id}`;
    
    var defaulttext = `[${time}] <${newState.member.user.username}#${newState.member.user.discriminator} (${newState.member.id})>`;
    var defaulttext2 = `[${time}] <${oldState.member.user.username}#${oldState.member.user.discriminator} (${oldState.member.id})>`;

    if (oldChannel && newChannel) {
        var logtext = `${defaulttext} : Voice Move ${oldChannel.name} (${oldChannel.id}) => ${newChannel.name} (${newChannel.id})`;
    } else if (!oldChannel) {
        var logtext = `${defaulttext} : Voice Join ${newChannel.name} (${newChannel.id})`;
    } else if (!newChannel) {
        var logtext = `${defaulttext2} : Voice Leave ${oldChannel.name} (${oldChannel.id})`;
    }

    if (oldState.selfMute && !newState.selfMute) {
        var logtext = `${defaulttext2} : Self Mute Off`;
    } else if (!oldState.selfMute && newState.selfMute) {
        var logtext = `${defaulttext2} : Self Mute On`;
    } else if (oldState.selfDeaf && !newState.selfDeaf) {
        var logtext = `${defaulttext2} : Self Deaf Off`;
    } else if (!oldState.selfDeaf && newState.selfDeaf) {
        var logtext = `${defaulttext2} : Self Deaf On`;
    } else if (oldState.serverDeaf && !newState.serverDeaf) {
        var logtext = `${defaulttext2} : Server Deaf Off`;
    } else if (!oldState.serverDeaf && newState.serverDeaf) {
        var logtext = `${defaulttext2} : Server Deaf On`;
    } else if (oldState.serverMute && !newState.serverMute) {
        var logtext = `${defaulttext2} : Server Mute Off`;
    } else if (!oldState.serverMute && newState.serverMute) {
        var logtext = `${defaulttext2} : Server Mute On`;
    }
    writeLog(null, foldername, filename, logtext);
});

//서버 설정 로그
client.on('guildUpdate', function (oldguild, newguild) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var filename = `ServerUpdate.txt`;
    var foldername = `${config.folder}/${date}/${newguild.id}`;

    if (newguild.name != oldguild.name) {
        var logtext = `[${time}] Server Name Change : ${oldguild.name} => ${newguild.name}`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.afkChannel.id != oldguild.afkChannel.id) {
        var logtext = `[${time}] Server AFK Channel Change : ${oldguild.afkChannel.name} (${oldguild.afkChannel.id}) => ${newguild.afkChannel.name} (${newguild.afkChannel.id})`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.afkTimeout != oldguild.afkTimeout) {
        var logtext = `[${time}] Server AFK Timeout Change : ${oldguild.afkTimeout} => ${newguild.afkTimeout}`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.mfaLevel != oldguild.mfaLevel) {
        var logtext = `[${time}] Server MFA Level Change : ${oldguild.mfaLevel} => ${newguild.mfaLevel}`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.owner != oldguild.owner) {
        var logtext = `[${time}] Server Owner Change : <${oldguild.owner.user.username}#${oldguild.owner.user.discriminator} (${oldguild.owner.user.id})> => <${newguild.owner.user.username}#${newguild.owner.user.discriminator} (${newguild.owner.user.id})>`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.premiumTier != oldguild.premiumTier) {
        var logtext = `[${time}] Server Premium Tier Change : ${oldguild.premiumTier} => ${newguild.premiumTier}`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.premiumSubscriptionCount != oldguild.premiumSubscriptionCount) {
        var logtext = `[${time}] Server Premium Member Change : ${oldguild.premiumSubscriptionCount} => ${newguild.premiumSubscriptionCount}`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.region != oldguild.region) {
        var logtext = `[${time}] Server Region Change : ${oldguild.region} => ${newguild.region}`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.verificationLevel != oldguild.verificationLevel) {
        var logtext = `[${time}] Server Verification Level Change : ${oldguild.verificationLevel} => ${newguild.verificationLevel}`
        writeLog(null, foldername, filename, logtext);
    }

    if (newguild.vanityURLCode != oldguild.vanityURLCode) {
        var logtext = `[${time}] Server Vanity URL Change : ${oldguild.vanityURLCode} => ${newguild.vanityURLCode}`
        writeLog('server', foldername, filename, logtext);
    }

    if (newguild.icon != oldguild.icon) {
        var logtext = `[${time}] Server Logo Change : ${path.basename(`${oldguild.iconURL({ format: 'png', dynamic: true})}`)} => ${path.basename(`${newguild.iconURL({ format: 'png', dynamic: true})}`)}`
        writeLog('server', foldername, filename, logtext, newguild.iconURL({
            format: 'png',
            dynamic: true
        }), null, path.basename(`${newguild.iconURL({ format: 'png', dynamic: true })}`));
    }

    if (newguild.banner != oldguild.banner) {
        var logtext = `[${time}] Server Banner Change : ${path.basename(`${oldguild.bannerURL({ format: 'png', dynamic: true})}`)} => ${path.basename(`${newguild.bannerURL({ format: 'png', dynamic: true})}`)}`
        writeLog('server', foldername, filename, logtext, newguild.bannerURL({
            format: 'png',
            dynamic: true
        }), null, path.basename(`${newguild.bannerURL({ format: 'png', dynamic: true })}`));
    }

    if (newguild.splash != oldguild.splash) {
        var logtext = `[${time}] Server Splash Change : ${path.basename(`${oldguild.splashURL({ format: 'png', dynamic: true})}`)} => ${path.basename(`${newguild.splashURL({ format: 'png', dynamic: true})}`)}`
        writeLog('server', foldername, filename, logtext, newguild.splashURL({
            format: 'png',
            dynamic: true
        }), null, path.basename(`${newguild.splashURL({ format: 'png', dynamic: true })}`));
    }
});

client.on('presenceUpdate', function (oldpresence, newpresence) {
    var date = moment().format("YYYY-MM-DD");
    var time = moment().format("HH:mm:ss");

    var foldername = `${config.folder}/${date}/${newpresence.guild.id}`;
    var filename = `ServerMemberStatus.txt`;

    if (newpresence.status != oldpresence.status) {
        if (oldpresence.status == null) {
            var logtext = `[${time}] <${newpresence.user.username}#${newpresence.user.discriminator} (${newpresence.user.id})> Status Change : ${newpresence.status}`;
        } else {
            var logtext = `[${time}] <${newpresence.user.username}#${newpresence.user.discriminator} (${newpresence.user.id})> Status Change : ${oldpresence.status} => ${newpresence.status}`;
        }
        writeLog(null, foldername, filename, logtext);
    }
});

//파일 기록 + 첨부파일 다운로드
function writeLog(type, foldername, filename, contents, url, id, name) {
    if (type == 'chat') { //로그 타입이 채팅이면
        var folder = foldername + '/files/'
    } else if (type == 'emoji') { //로그 타입이 이모지이면
        var folder = foldername + '/emoji/'
    } else if (type == 'server') { //로그 타입이 서버이면
        var folder = foldername + '/server/'
    } else { //로그 타입이 그 외라면
        var folder = foldername
    }
    fs.stat(folder, function (err) { //로그 폴더 체크
        if (!err) { //해당 폴더가 있다면
            fs.stat(foldername + '/' + filename, function (err) { //로그 파일 체크
                if (!err) { //로그 파일이 있다면
                    fsextra.appendFile(foldername + '/' + filename, '\n' + contents, 'utf8') //기록 추가
                    if (url) { //첨부파일이 있다면
                        if (type == 'chat') {
                            var path = folder + id + "-" + name //파일 이름 설정 (메세지ID-파일이름)
                            request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                        } else {
                            var path = folder + name //파일 이름 설정 (파일이름)
                            request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                        }
                    };
                } else if (err.code === 'ENOENT') { //로그 파일이 없다면
                    if (url) { //첨부파일이 있다면
                        if (type == 'chat') {
                            var path = folder + id + "-" + name //파일 이름 설정 (메세지ID-파일이름)
                            request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                        } else {
                            var path = folder + name //파일 이름 설정 (파일이름)
                            request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                        }
                    };
                    fsextra.outputFile(foldername + '/' + filename, contents, 'utf8') //로그 파일 생성
                };
            });
        } else if (err.code === 'ENOENT') { //해당 폴더가 없다면
            fsextra.mkdirp(folder, function () { //해당 폴더를 생성
                fs.stat(foldername + '/' + filename, function (err) { //로그 파일 체크
                    if (!err) { //로그 파일이 있다면
                        fsextra.appendFile(foldername + '/' + filename, '\n' + contents, 'utf8') //기록 추가
                        if (url) { //첨부파일이 있다면
                            if (type == 'chat') {
                                var path = folder + id + "-" + name //파일 이름 설정 (메세지ID-파일이름)
                                request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                            } else {
                                var path = folder + name //파일 이름 설정 (파일이름)
                                request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                            }
                        };
                        var logtext = ""
                    } else if (err.code === 'ENOENT') { //로그 파일이 없다면
                        if (url) { //첨부파일이 있다면
                            if (type == 'chat') {
                                var path = folder + id + "-" + name //파일 이름 설정 (메세지ID-파일이름)
                                request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                            } else {
                                var path = folder + name //파일 이름 설정 (파일이름)
                                request.get(url).on('error', console.error).pipe(fsextra.createWriteStream(path)) //첨부파일 다운로드
                            }
                        };
                        fsextra.outputFile(foldername + '/' + filename, contents, 'utf8') //로그 파일 생성
                    };
                });
            })
        };
    });
    var logtext = ""
};


client.login(config.token);