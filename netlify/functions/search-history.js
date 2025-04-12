const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  // Kiểm tra phương thức HTTP
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Chỉ chấp nhận phương thức POST" })
    };
  }

  // Lấy địa chỉ IP thực từ headers của Netlify
  const clientIP = event.headers['x-forwarded-for'] || 'Unknown';
  
  try {
    // Parse dữ liệu từ body
    const data = JSON.parse(event.body);
    
    // Thêm IP và thời gian server vào dữ liệu
    const searchRecord = {
      ...data,
      ip: clientIP,
      serverTimestamp: new Date(),
    };
    
    // Kết nối đến MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    const collection = client.db(process.env.MONGODB_DB_NAME).collection('search_history');
    
    // Lưu bản ghi tìm kiếm
    console.log("📥 Dữ liệu chuẩn bị insert:", searchRecord);

    await collection.insertOne(searchRecord);

    console.log("✅ Đã insert thành công!");
    
    await client.close();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Đã lưu lịch sử tìm kiếm thành công" })
    };
    
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử tìm kiếm:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Lỗi server: ${error.message}` })
    };
  }
};