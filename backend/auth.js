const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'ZORKPC4mBwesOnw3WChh4wVqrJ0exm25SJkn7WBK';

//In-memory user store
const users = [
    {
        username: 'admin1',
        password: '0ca7539a8577dd196641e11315f8fc7d1dba9cc2741752642def9bcdb3599467'
    }
]


// Generate JWT
function generateToken(user) {
  const payload = {
    username: user.username,
  };
  return jwt.encode(payload, SECRET_KEY);
}


// Authenticate user and login
function authenticate(req, res) {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = generateToken(user);
  return res.json({ token });
}

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token is required' });
  }

  try {
    const decoded = jwt.decode(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate, verifyToken };