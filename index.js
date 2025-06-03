import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.CHAT_ID;
const UZUM_API_KEY = process.env.UZUM_API_KEY;

// ID товара с Uzum
const PRODUCT_ID = "380339";

// Отправка сообщения в Telegram
const sendTelegramMessage = async (text) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    }),
  });
};

// Получение отзывов с Uzum
const getReviews = async () => {
  const response = await fetch(`https://api.seller.uzum.uz/api/products/${PRODUCT_ID}/feedbacks`, {
    headers: {
      Authorization: `Bearer ${UZUM_API_KEY}`
    }
  });

  if (!response.ok) {
    console.error('Ошибка при получении отзывов с Uzum');
    return;
  }

  const data = await response.json();
  if (data?.payload?.feedbacks?.length > 0) {
    const reviews = data.payload.feedbacks;
    for (const review of reviews) {
      const message = `<b>Новый отзыв</b>
⭐ ${review.rating}
${review.text || 'Без текста'}`;
      await sendTelegramMessage(message);
    }
  } else {
    console.log('Нет отзывов или пустой ответ');
  }
};

app.get('/', async (req, res) => {
  try {
    await getReviews();
    res.send('Отзывы получены и отправлены в Telegram!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при получении отзывов');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

getReviews();
