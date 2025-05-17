const https = require("https");
const cheerio = require("cheerio");

module.exports = (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: "Keyword is required" });

  const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  };

  https.get(url, options, (response) => {
    let html = "";

    response.on("data", (chunk) => { html += chunk; });
    response.on("end", () => {
      const $ = cheerio.load(html);
      const domains = [];

      $("a").each((i, el) => {
        const href = $(el).attr("href");
        if (href && href.startsWith("/url?q=")) {
          const domainUrl = href.split("/url?q=")[1].split("&")[0];
          try {
            const domain = new URL(domainUrl).hostname;
            if (!domains.includes(domain)) domains.push(domain);
          } catch (e) {}
        }
      });

      res.json(domains);
    });
  }).on("error", (e) => {
    res.status(500).json({ error: "Failed to fetch" });
  });
};
