import 'dotenv/config';
import Cardinal from "./core";
import HelpCommand from './commands/help';
import KickCommand from './commands/mod/kick';
import BanCommand from './commands/mod/ban';
import AnimeCommand from './commands/anime';

// Create an instance of the bot
const bot = new Cardinal(process.env.PREFIX ?? '!');

// Register commands
bot.registry.registerCommands(
  // Utility Commands
  HelpCommand,

  // Moderation commands
  KickCommand,
  BanCommand,

  // Anime/Manga commands
  AnimeCommand
);

// Authenticate with Discord.
bot.login();

