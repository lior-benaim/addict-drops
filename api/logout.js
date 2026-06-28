module.exports = (req, res) => {
  res.setHeader('Set-Cookie',
    'addict_auth=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
  );
  res.setHeader('Location', '/');
  return res.status(302).end();
};
