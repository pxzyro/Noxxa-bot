const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message, Partials.User] });
const TOKEN = process.env.TOKEN;
const commands = [
    new SlashCommandBuilder().setName('help').setDescription('Lihat fitur Noxxa'),
    new SlashCommandBuilder().setName('chat').setDescription('Ngobrol dengan AI Noxxa').addStringOption(o => o.setName('pesan').setDescription('Pesan kamu').setRequired(true)),
    new SlashCommandBuilder().setName('clear').setDescription('Hapus pesan').addIntegerOption(o => o.setName('jumlah').setDescription('Jumlah pesan').setRequired(true)),
    new SlashCommandBuilder().setName('ban').setDescription('Ban member').addUserOption(o => o.setName('member').setDescription('Member yang mau di ban').setRequired(true)).addStringOption(o => o.setName('alasan').setDescription('Alasan ban')),
].map(c => c.toJSON());
client.once('ready', async () => {
    console.log(`✅ Noxxa online sebagai ${client.user.tag}`);
    client.user.setActivity('AI • MODERATION • 24/7', { type: 3 });
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try { await rest.put(Routes.applicationCommands(client.user.id), { body: commands }); console.log('✅ Slash command ter-sync!'); } catch (e) { console.error(e); }
});
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(c => c.name === 'general') || member.guild.systemChannel;
    if (!channel) return;
    const embed = new EmbedBuilder().setTitle('Welcome to Noxxa Family! 👋').setDescription(`Hai ${member}, selamat datang di **${member.guild.name}**!`).setColor(0x00ffff).setThumbnail(client.user.displayAvatarURL());
    channel.send({ embeds: [embed] });
});
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'help') {
        const embed = new EmbedBuilder().setTitle('✨ Noxxa - AI Bot Menu').setColor(0x00ffff).addFields({ name: '🤖 AI Chat', value: '/chat [pesan]' }, { name: '🛡️ Moderation', value: '/ban, /clear' }).setFooter({ text: 'Noxxa • 24/7 ONLINE' });
        await interaction.reply({ embeds: [embed] });
    }
    if (interaction.commandName === 'chat') {
        const pesan = interaction.options.getString('pesan');
        await interaction.deferReply();
        await interaction.editReply(`Kamu bilang: **${pesan}**\nAku Noxxa, siap bantu 24/7 🤖✨`);
    }
    if (interaction.commandName === 'clear') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: '❌ Butuh Manage Messages!', ephemeral: true });
        const jumlah = interaction.options.getInteger('jumlah');
        await interaction.channel.bulkDelete(jumlah, true);
        await interaction.reply({ content: `✅ Hapus ${jumlah} pesan!`, ephemeral: true });
    }
    if (interaction.commandName === 'ban') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: '❌ Butuh Ban Members!', ephemeral: true });
        const member = interaction.options.getMember('member');
        const alasan = interaction.options.getString('alasan') || 'Tidak ada alasan';
        await member.ban({ reason: alasan });
        await interaction.reply(`🔨 ${member} di-ban! Alasan: ${alasan}`);
    }
});
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const badWords = ["anjing", "babi", "kasar"];
    if (badWords.some(w => message.content.toLowerCase().includes(w))) {
        await message.delete();
        const msg = await message.channel.send(`${message.author} jangan toxic ya! ⚠️`);
        setTimeout(() => msg.delete(), 5000);
    }
});
client.login(TOKEN);
