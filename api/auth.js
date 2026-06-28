const crypto = require('crypto');

function makeToken(pass) {
  return crypto.createHmac('sha256', pass + '_addict_2026')
    .update('addict_authenticated')
    .digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  let body = '';
  await new Promise(resolve => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
  });

  let data;
  try { data = JSON.parse(body); }
  catch { return res.status(400).end('Invalid request'); }

  const { username, password } = data;
  const validUser = (process.env.user_name || '').trim().toUpperCase();
  const validPass = (process.env.password || '').trim();

  if (
    username && password &&
    username.trim().toUpperCase() === validUser &&
    password.trim() === validPass
  ) {
    const token = makeToken(validPass);
    res.setHeader('Set-Cookie',
      `addict_auth=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60*60*24*30}; Path=/`
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
};
