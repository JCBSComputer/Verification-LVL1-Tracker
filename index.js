require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const RULES_CHANNEL_ID = process.env.RULES_CHANNEL_ID;
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
const RULES_EMOJI = process.env.RULES_EMOJI || '✅';
const VERIFY_TIMEOUT_MS = 5 * 60 * 1000;

const pendingTimeouts = new Map();

function hasRoleAtOrAbove(member) {
  const verifiedRole = member.guild.roles.cache.get(VERIFIED_ROLE_ID);
  if (!verifiedRole) return false;
  return member.roles.cache.some(r => r.id !== member.guild.id && r.position >= verifiedRole.position);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  if (member.guild.id !== GUILD_ID) return;
  if (hasRoleAtOrAbove(member)) return;

  const channel = member.guild.channels.cache.get(RULES_CHANNEL_ID);
  if (!channel) {
    console.error('Rules channel not found');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('📜 Server Rules')
    .setDescription(
      'Welcome to the server! Please read the rules below and react with ' +
      `${RULES_EMOJI} within 10 minutes or you will be kicked.\n\n` +
      '1. Be respectful to all members.\n' +
      '2. No spamming or self-promotion.\n' +
      '3. Follow Discord\'s Terms of Service.\n' +
      '4. Use appropriate channels for discussions.'
    )
    .setFooter({ text: `React with ${RULES_EMOJI} to get verified` });

  const sent = await channel.send({ content: `<@${member.id}>`, embeds: [embed] });
  await sent.react(RULES_EMOJI);

  const filter = (reaction, user) =>
    reaction.emoji.name === RULES_EMOJI && user.id === member.id;

  const collector = sent.createReactionCollector({ filter, max: 1, time: VERIFY_TIMEOUT_MS });

  const timeout = setTimeout(async () => {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;
    try {
      const guildMember = await guild.members.fetch(member.id);
      if (guildMember && !hasRoleAtOrAbove(guildMember)) {
        await guildMember.kick('Did not verify within 10 minutes');
        channel.send(`<@${member.id}> was kicked for not verifying in time.`).catch(() => {});
      }
    } catch (err) {
      if (err.code !== 10007) console.error('Kick failed:', err);
    }
  }, VERIFY_TIMEOUT_MS);

  pendingTimeouts.set(member.id, timeout);

  collector.on('collect', async () => {
    clearTimeout(pendingTimeouts.get(member.id));
    pendingTimeouts.delete(member.id);

    const role = member.guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (!role) {
      console.error('Verified role not found');
      return;
    }
    await member.roles.add(role);
    await channel.send(`<@${member.id}> has been verified!`);
  });

  collector.on('end', (collected) => {
    pendingTimeouts.delete(member.id);
  });
});

client.login(TOKEN);
