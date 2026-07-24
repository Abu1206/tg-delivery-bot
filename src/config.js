import dotenv from 'dotenv';
dotenv.config();

/**
 * Validated environment configuration object.
 */
const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  PORT: parseInt(process.env.PORT || '3000', 10),
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || 'sk_test_mock_secret_key',
};

/**
 * Validates critical environment variables.
 */
export function validateConfig() {
  if (!config.BOT_TOKEN || config.BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    console.warn('\n⚠️ WARNING: BOT_TOKEN is not configured or using placeholder value in .env file!');
    console.warn('To connect to Telegram, please set a valid token from @BotFather in your .env file.\n');
  }
}

export default config;
