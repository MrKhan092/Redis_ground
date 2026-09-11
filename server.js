const express = require('express');
const axios = require('axios');
const redis = require('./client');

const app = express();

app.get('/users', async (req, res) => {
  try {
    // 1. Check Redis first
    const cachedData = await redis.get('users');

    if (cachedData) {
      console.log('FROM REDIS');

      return res.json(JSON.parse(cachedData));
    }

    // 2. Redis doesn't have data
    console.log('FROM API');

    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/users'
    );

    const users = response.data;

    // 3. Store data in Redis
    await redis.set(
      'users',
      JSON.stringify(users),
      'EX',
      60
    );

    // 4. Return data
    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});