const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function makeToken(pass) {
  return crypto.createHmac('sha256', pass + '_addict_2026')
    .update('addict_authenticated')
    .digest('hex');
}

function parseCookies(cookieHeader) {
  const cookies = {};
  (cookieHeader || '').split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    if (k) cookies[k.trim()] = v.join('=').trim();
  });
  return cookies;
}

module.exports = async (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['addict_auth'];
  const validPass = (process.env.password || '').trim();
  const validToken = makeToken(validPass);

  if (!token || token !== validToken) {
    // Not authenticated - redirect to login
    res.setHeader('Location', '/');
    return res.status(302).end();
  }

  // Serve app.html with no-cache headers so refresh always hits server
  const appPath = path.join(process.cwd(), 'app.html');
  const html = fs.readFileSync(appPath, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  return res.status(200).send(html);
};
