const crypto = require('crypto');

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

module.exports = (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['addict_auth'];
  const validPass = (process.env.password || '').trim();
  const validToken = makeToken(validPass);

  if (token && token === validToken) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false });
};
