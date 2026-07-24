import config, { validateConfig } from './src/config.js';
import { initBot } from './src/bot.js';
import { startServer } from './src/server.js';

async function main() {
  console.log('Starting Telegram Delivery Bot Application...');

  validateConfig();
  startServer(config.PORT);

  const bot = initBot();

  if (bot) {
    try {
      await bot.launch();
      console.log('Telegram bot successfully launched and listening for updates.');
    } catch (err) {
      console.error('Failed to launch Telegram bot polling:', err.message);
      console.log('Make sure you set a valid BOT_TOKEN in your .env file.');
    }

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  }
}

main().catch((err) => {
  console.error('Fatal error starting application:', err);
});

