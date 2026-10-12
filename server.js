const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cơ sở dữ liệu tạm thời (In-memory Database)
let rooms = [
  { id: '101', name: 'Phòng Deluxe 101', type: 'Deluxe Single', price: 1200000, status: 'available', booking: null },
  { id: '102', name: 'Phòng Deluxe 102', type: 'Deluxe Double', price: 1800000, status: 'available', booking: null },
  { id: '201', name: 'Phòng Suite Premium 201', type: 'Suite', price: 3500000, status: 'available', booking: null },
  { id: '202', name: 'Phòng Executive 202', type: 'Executive Suite', price: 5000000, status: 'available', booking: null },
  { id: '301', name: 'Phòng Standard 301', type: 'Standard Single', price: 800000, status: 'available', booking: null }
];

// API Endpoints
// Lấy danh sách phòng
app.get('/api/rooms', (req, res) => {
  res.status(200).json(rooms);
});

// Đặt phòng
app.post('/api/bookings', (req, res) => {
  const { roomId, customerName, customerEmail, checkInDate, checkOutDate } = req.body;

  if (!roomId || !customerName || !customerEmail || !checkInDate || !checkOutDate) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin yêu cầu.' });
  }

  const roomIndex = rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) {
    return res.status(404).json({ message: 'Không tìm thấy phòng yêu cầu.' });
  }

  if (rooms[roomIndex].status === 'booked') {
    return res.status(400).json({ message: 'Phòng này đã được đặt trước đó.' });
  }

  // Tính toán số ngày ở và tổng chi phí
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = rooms[roomIndex].price * diffDays;

  // Cập nhật trạng thái phòng
  rooms[roomIndex].status = 'booked';
  rooms[roomIndex].booking = {
    id: 'BK-' + Date.now(),
    customerName,
    customerEmail,
    checkInDate,
    checkOutDate,
    totalPrice
  };

  // Phát sự kiện cập nhật thời gian thực tới toàn bộ client đang kết nối
  io.emit('rooms-updated', rooms);

  return res.status(201).json({
    message: 'Đặt phòng thành công!',
    room: rooms[roomIndex]
  });
});

// Hủy đặt phòng
app.delete('/api/bookings/:roomId', (req, res) => {
  const { roomId } = req.params;
  const roomIndex = rooms.findIndex(r => r.id === roomId);

  if (roomIndex === -1) {
    return res.status(404).json({ message: 'Không tìm thấy phòng yêu cầu.' });
  }

  if (rooms[roomIndex].status === 'available') {
    return res.status(400).json({ message: 'Phòng này hiện đang trống, không thể hủy.' });
  }

  // Reset trạng thái phòng về trống
  rooms[roomIndex].status = 'available';
  rooms[roomIndex].booking = null;

  // Phát sự kiện cập nhật thời gian thực tới toàn bộ client đang kết nối
  io.emit('rooms-updated', rooms);

  return res.status(200).json({
    message: 'Hủy đặt phòng thành công!',
    rooms: rooms
  });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('Một client mới đã kết nối:', socket.id);
  // Gửi danh sách phòng hiện tại ngay khi client kết nối
  socket.emit('init-rooms', rooms);

  socket.on('disconnect', () => {
    console.log('Client đã ngắt kết nối:', socket.id);
  });
});

// Khởi chạy Server
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🏨 HOTEL BOOKING SYSTEM IS RUNNING ON PORT: ${PORT}`);
  console.log(`👉 URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
```

---