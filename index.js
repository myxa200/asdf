const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.CHAT_ID;
const UZUM_API_KEY = process.env.UZUM_API_KEY;
const PRODUCT_ID = "380339";

const sendTelegramMessage = async (text) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });
};

const getReviews = async () => {
  const response = await fetch(`https://api.seller.uzum.uz/api/products/380339/feedbacks`, {
    headers: {Authorization: `Bearer ${UZUM_API_KEY}`}
  });
  if (!response.ok) {
    console.error('Ошибка при получении отзывов');
    return;
  }

  const data = await response.json();
  if (data?.content?.length) {
    const review = data.content[0];
    const message = `🛍 <b>Новый отзыв</b>

⭐️ Оценка: ${review.rating}
💬 Комментарий: ${review.text || 'Нет текста'}
🕒 Дата: ${review.createdDate}`;
    await sendTelegramMessage(message);
  } else {
    console.log('Нет новых отзывов');
  }
};

app.get('/', async (req, res) => {
  await getReviews();
  res.send('Отзыв проверен и отправлен (если был).');
});

app.listen(PORT, () => {
  console.log(`Bot started on port ${PORT}`);
});
getReviews();
