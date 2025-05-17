const https = require("https");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: "Keyword is required" });

  const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;

  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
    let html = "";
    response.on("data", (chunk) => { html += chunk; });
    response.on("end", () => {
      const $ = cheerio.load(html);
      const links = [];
      $("a").each((i, el) => {
        const href = $(el).attr("href");
        if (href && href.includes("/url?q=")) {
          const clean = href.split("/url?q=")[1].split("&")[0];
          try {
            const domain = new URL(clean).hostname;
            if (!links.includes(domain)) links.push(domain);
          } catch (e) {}
        }
      });
      res.json(links);
    });
  });
};
