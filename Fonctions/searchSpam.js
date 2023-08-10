const UserMap = new Map();

module.exports = async (bot, message) => {
  const uwu = message.author;
  if (UserMap.get(uwu.id)) {
    const UserData = UserMap.get(uwu.id);
    const { lastMessage, timer } = UserData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let msgCount = UserData.msgCount;
    const db = bot.db;

    if (difference > 3000) {
      clearTimeout(timer);
      UserData.msgCount = 1;
      UserData.lastMessage = message;

      UserData.timer = setTimeout(() => {
        UserMap.delete(uwu.id);
      }, 10000);

      UserMap.set(uwu.id, UserData);
    } else {
      msgCount++;

      if (msgCount >= 3) {
        const member = message.guild.members.cache.get(uwu.id);
        await message.channel.send(`⚠️ Attention ${member}, vous envoyez trop de messages en peu de temps, je viens de vous retirer 10 xp !`);
        db.query(`SELECT * FROM user WHERE userID = ${uwu.id}`, async (err, req) => {
          if (req.length < 1) return;
          db.query(`UPDATE user SET xp = '${parseInt(req[0].xp) - 10}' WHERE userID = ${uwu.id}`);
        });

        const messages = [
          ...(await message.channel.messages.fetch({
            limit: 5,
            before: message.id,
          }))
            .filter((msg) => msg.author.id === message.author.id)
            .values(),
        ];

        await message.channel.bulkDelete(messages);
      } else {
        UserData.msgCount = msgCount;
        UserMap.set(uwu.id, UserData);
      }
    }
  } else {
    let fn = setTimeout(() => {
      UserMap.delete(uwu.id);
    }, 10000);

    UserMap.set(uwu.id, {
      msgCount: 1,
      lastMessage: message,
      timer: fn,
    });
  }
};
