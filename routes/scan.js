import express from 'express';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const router = express.Router();

router.get('/api/scan', async (req, res) => {
  const keywordRaw = req.query.keyword;
  if (!keywordRaw) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  const keyword = keywordRaw.trim();
  const resultsSet = new Set();

  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      // timeout: 10000, // node-fetch v3 tidak support timeout langsung, bisa pakai AbortController jika perlu
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch search results' });
    }

    const html = await response.text();

    if (html.includes('Our systems have detected unusual traffic')) {
      return res.status(429).json({ error: 'Google blocked the request due to unusual traffic (CAPTCHA).' });
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Cari semua div dengan class 'g' yang biasanya berisi hasil pencarian utama
    const resultDivs = [...document.querySelectorAll('div.g')];

    for (const div of resultDivs) {
      // Dalam div.g biasanya ada link utama dalam tag <a>
      const a = div.querySelector('a');
      if (!a) continue;

      const href = a.href;
      if (!href) continue;

      try {
        const url = new URL(href);
        if (url.protocol.startsWith('http')) {
          resultsSet.add(url.hostname);
        }
      } catch {
        continue;
      }
    }

    const results = Array.from(resultsSet).slice(0, 100);

    if (results.length === 0) {
      return res.json({ message: 'Tidak ada hasil untuk kata kunci ini.' });
    }

    res.json(results);

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
