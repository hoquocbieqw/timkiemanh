// functions/get-search-history.js
const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  // Kiểm tra xác thực
  const apiKey = event.queryStringParameters.key;
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // Tham số phân trang
  const page = parseInt(event.queryStringParameters.page) || 1;
  const limit = parseInt(event.queryStringParameters.limit) || 50;
  const skip = (page - 1) * limit;

  let client;
  try {
    // Kết nối MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('searches');
    
    // Lấy dữ liệu và tổng số
    const [searches, total] = await Promise.all([
      collection.find()
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
      collection.countDocuments()
    ]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searches,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    if (client) await client.close();
  }
};