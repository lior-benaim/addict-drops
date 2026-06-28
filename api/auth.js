const { serialize } = require('cookie');
const crypto = require('crypto');

const SECRET = process.env.password + '_addict_secret_2026';

function makeToken() {
  return crypto.createHmac('sha256', SECRET)
    .update('addict_authenticated')
    .digest('hex');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = '';
  await new Promise(resolve => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
  });

  let data;
  try { data = JSON.parse(body); }
  catch { return res.status(400).json({ error: 'Invalid request' }); }

  const { username, password } = data;

  const validUser = process.env.user_name;
  const validPass = process.env.password;

  if (
    username && password &&
    username.trim().toUpperCase() === validUser.trim().toUpperCase() &&
    password === validPass
  ) {
    const token = makeToken();
    const cookie = serialize('addict_auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
};
