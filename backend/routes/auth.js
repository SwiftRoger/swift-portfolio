router.post('/login', (req, res) => {
  const { password } = req.body;

  console.log('--- LOGIN REQUEST ---');
  console.log('Input password:', password);
  console.log('Env password:', process.env.ADMIN_PASSWORD);

  if (password !== process.env.ADMIN_PASSWORD) {
    console.log('RESULT: DENIED');
    return res.status(401).json({ message: 'Access denied' });
  }

  console.log('RESULT: SUCCESS');

  const token = jwt.sign(
    { admin: true },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
});