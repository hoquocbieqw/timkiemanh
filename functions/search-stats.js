// functions/search-stats.js
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

  let client;
  try {
    // Kết nối MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection('searches');
    
    // Lấy thống kê
    const [
      totalSearches,
      mostPopularSearches,
      uniqueUsers,
      searchesToday
    ] = await Promise.all([
      // Tổng số lượt tìm kiếm
      collection.countDocuments(),
      
      // Từ khóa phổ biến nhất
      collection.aggregate([
        { $group: { _id: { query: "$query" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        { $project: { _id: 0, query: "$_id.query", count: 1 } }
      ]).toArray(),
      
      // Số người dùng khác nhau
      collection.distinct('ip').then(ips => ips.length),
      
      // Số lượt tìm kiếm hôm nay
      collection.countDocuments({
        timestamp: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalSearches,
        mostPopularSearch: mostPopularSearches[0] || null,
        uniqueUsers,
        searchesToday
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