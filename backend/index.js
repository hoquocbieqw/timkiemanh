const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 KẾT NỐI MONGODB 
mongoose.connect('mongodb+srv://thobienuser:thobienuser@tho-bien.kc0p3sh.mongodb.net/?retryWrites=true&w=majority&appName=tho-bien')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

// 🗃️ SCHEMA lịch sử tìm kiếm
const SearchSchema = new mongoose.Schema({
  keyword: String,
  createdAt: { type: Date, default: Date.now }
});
const Search = mongoose.model('Search', SearchSchema);

// 💾 API GHI DỮ LIỆU VÀO MONGODB
app.post('/api/saveSearch', async (req, res) => {
  const { keyword } = req.body;
  try {
    await Search.create({ keyword });
    res.status(200).json({ message: 'Đã lưu từ khóa' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi ghi dữ liệu' });
  }
});

// 🚀 KHỞI ĐỘNG SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server đang chạy tại http://localhost:${PORT}`));
