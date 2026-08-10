const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Env vars — задаются в Railway
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID   = process.env.CHAT_ID;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Отправка заявки в Telegram ──────────────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  try {
    const { name, phone, scheme, markets, comment, source } = req.body;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('BOT_TOKEN или CHAT_ID не заданы');
      return res.status(500).json({ ok: false, error: 'Bot not configured' });
    }

    const marketList = Array.isArray(markets) && markets.length
      ? markets.join(', ')
      : '—';

    const text =
`🔥 <b>Новая заявка с сайта КРД Фулфилмент</b>

👤 <b>Имя:</b> ${name || '—'}
📞 <b>Телефон:</b> ${phone || '—'}
📦 <b>Схема:</b> ${scheme || '—'}
🛒 <b>Маркетплейсы:</b> ${marketList}
💬 <b>Комментарий:</b> ${comment || '—'}
📍 <b>Источник:</b> ${source || 'форма на сайте'}`;

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: 'HTML',
        }),
      }
    );

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Telegram API error:', tgData);
      return res.status(502).json({ ok: false, error: tgData.description });
    }

    return res.json({ ok: true });

  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Все остальные пути → index.html (SPA-fallback) ──────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`КРД Фулфилмент запущен на порту ${PORT}`);
});
