# Verification-LVL1-Tracker

A Discord bot that auto-verifies new members by reacting to server rules. When a new member joins, a rules embed is posted in the rules channel. If they react with the specified emoji within 10 minutes, they receive the verified role. If they do not react in time, they are kicked.

## Requirements

- [Node.js](https://nodejs.org/) v16.9.0 or higher (for discord.js v14)
- npm (included with Node.js)

## Setup

1. Clone the repository and navigate to the folder:
   ```bash
   cd Verification-LVL1-Tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your Discord bot credentials:
   ```
   TOKEN=your_bot_token_here
   GUILD_ID=your_guild_id_here
   RULES_CHANNEL_ID=your_rules_channel_id_here
   VERIFIED_ROLE_ID=your_verified_role_id_here
   RULES_EMOJI=✅
   ```

### Environment Variables

| Variable          | Description                              | Default |
|-------------------|------------------------------------------|---------|
| `TOKEN`           | Discord bot token                        | —       |
| `GUILD_ID`        | Discord server (guild) ID                | —       |
| `RULES_CHANNEL_ID`| Channel ID where rules are posted        | —       |
| `VERIFIED_ROLE_ID`| Role ID to assign upon verification      | —       |
| `RULES_EMOJI`     | Emoji to react with for verification     | ✅      |

## Usage

Start the bot:

```bash
npm start
```

Or directly:

```bash
node index.js
```

The bot requires the following **Gateway Intents** enabled in the [Discord Developer Portal](https://discord.com/developers/applications):

- Guilds
- Guild Members
- Guild Messages
- Message Content
- Guild Message Reactions

### How It Works

1. When a member joins the guild, the bot posts an embed with the server rules in the configured rules channel and mentions the member.
2. The bot adds a reaction (default ✅) to the message.
3. If the member reacts with that emoji within 10 minutes, they receive the verified role and a confirmation message is sent.
4. If the member does not react within 10 minutes, they are kicked from the server.
5. Members who already have a role at or above the verified role position are skipped.

## Project Structure

```
Verification-LVL1-Tracker/
├── index.js          # Main bot entry point
├── package.json
├── .env.example      # Example environment variables
├── .gitignore
└── README.md
```

## License

MIT
