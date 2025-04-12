const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://thobienuser:<thobienuserthobienuser>@tho-bien.kc0p3sh.mongodb.net/?retryWrites=true&w=majority&appName=tho-bien';

const client = new MongoClient(uri);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { keyword, time } = JSON.parse(event.body);

  try {
    await client.connect();
    const db = client.db('image_search');
    const logs = db.collection('search_logs');

    await logs.insertOne({ keyword, time });

    return { statusCode: 200, body: 'Logged successfully' };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};