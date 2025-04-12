fetch('/.netlify/functions/logSearch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keyword: 'ảnh mèo',      // từ khóa tìm kiếm
      time: new Date().toISOString()
    })
  });
  exports.handler = async (event, context) => {
    await client.connect();
    const db = client.db('image_search');
    const logs = await db.collection('search_logs').find().sort({ time: -1 }).toArray();
  
    return {
      statusCode: 200,
      body: JSON.stringify(logs)
    };
  };