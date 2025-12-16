import { Reading } from '../types';
import { getGlucoseStatus } from '../utils/helpers';

// Hardcoded token - strictly enforced
const DEFAULT_BOT_TOKEN = "8212019317:AAEt4WUq8L3oGL4t6YEabx2YM5S7NniCAtU";

export const sendTelegramNotification = async (reading: Reading) => {
  const storedChatId = localStorage.getItem('telegram_chat_id');
  
  // Strictly use the default token, do not read from localStorage to prevent misuse
  const botToken = DEFAULT_BOT_TOKEN;
  const chatId = storedChatId;

  if (!chatId) return;

  const status = getGlucoseStatus(reading.value, reading.type);
  
  // Status Emojis
  let emoji = '🩸';
  if (status === 'Low') emoji = '⚠️ 📉';
  if (status === 'High') emoji = '⚠️ 📈';
  if (status === 'Normal') emoji = '✅';

  const message = `
*New Glucose Reading* ${emoji}

*Level:* ${reading.value} mg/dL
*Status:* ${status}
*Type:* ${reading.type}
*Time:* ${reading.date} ${reading.time}
`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
};

// Simplified signature since we don't need the token passed in anymore
export const sendTestMessage = async (chatId: string): Promise<boolean> => {
  const botToken = DEFAULT_BOT_TOKEN;
  
  if (!chatId) return false;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const message = `🔔 *GlucoTrack Connection Test*\n\nIf you are reading this, your notifications are set up correctly! ✅`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Test message failed:', error);
    return false;
  }
};