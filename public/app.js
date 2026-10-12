// Kết nối Socket.io Client
const socket = io();

let allRooms = [];

// DOM Elements
const roomsGrid = document.getElementById('rooms-grid');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

// Modal Elements
const bookingModal = document.getElementById('booking-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const bookingForm = document.getElementById('booking-form');
const modalRoomId = document.getElementById('modal-room-id');
const modalTitle = document.getElementById('modal-title');
const summaryPrice = document.getElementById('summary-price');
const summaryTotalPrice = document.getElementById('summary-total-price');
const checkInInput = document.getElementById('check-in-date');
const checkOutInput = document.getElementById('check-out-date');

// Thiết lập ngày mặc định cho form đặt phòng (Hôm nay và ngày mai)
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
checkInInput.min = today;
checkInInput.value = today;
checkOutInput.min = tomorrow;
checkOutInput.value = tomorrow;

// Lắng nghe sự kiện từ Socket.io Server
socket.on('init-rooms', (rooms) => {
  allRooms = rooms;
  renderRooms();
});

socket.on('rooms-updated', (rooms) => {
  allRooms = rooms;
  renderRooms();
});

// Hàm định dạng tiền tệ VND
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Tính toán tổng chi phí động dựa trên số ngày ở
function updateSummaryTotal() {
  const roomId = modalRoomId.value;
  const room = allRooms.find(r => r.id === roomId);
  if (!room) return;

  const checkIn = new Date(checkInInput.value);
  const checkOut = new Date(checkOutInput.value);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    summaryTotalPrice.textContent = formatVND(room.price);
    return;
  }

  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  summaryTotalPrice.textContent = formatVND(room.price * diffDays);
}

// Lắng nghe thay đổi ngày để cập nhật tổng tiền
checkInInput.addEventListener('change', () => {
  checkOutInput.min = checkInInput.value;
  if (new Date(checkOutInput.value) <= new Date(checkInInput.value)) {
    const nextDay = new Date(new Date(checkInInput.value).getTime() + 86400000);
    checkOutInput.value = nextDay.toISOString().split('T')[0];
  }
  updateSummaryTotal();
});

checkOutInput.addEventListener('change', updateSummaryTotal);

// Render danh sách phòng ra giao diện
function renderRooms() {
  const searchQuery = searchInput.value.toLowerCase();
  const filterValue = statusFilter.value;

  roomsGrid.innerHTML = '';

  const filteredRooms = allRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery) || room.type.toLowerCase().includes(searchQuery);
    const matchesStatus = filterValue === 'all' || room.status === filterValue;
    return matchesSearch && matchesStatus;
  });

  if (filteredRooms.length === 0) {
    roomsGrid.innerHTML = `<p class="no-rooms" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px 0;">Không tìm thấy phòng nào phù hợp với tiêu chí tìm kiếm.</p>`;
    return;
  }

  filteredRooms.forEach(room => {
    const isAvailable = room.status === 'available';
    const card = document.createElement('div');
    card.className = `room-card card`;
    card.setAttribute('data-room-id', room.id);

    let bookingDetailsHTML = '';
    if (room.booking) {
      bookingDetailsHTML = `
        <div class="booking-info">
          <p><strong>Khách:</strong> ${room.booking.customerName}</p>
          <p><strong>Thời gian:</strong> ${room.booking.checkInDate} đến ${room.booking.checkOutDate}</p>
          <p><strong>Tổng tiền:</strong> ${formatVND(room.booking.totalPrice)}</p>
        </div>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="room-header">
          <h3 class="room-title">${room.name}</h3>
          <span class="room-badge ${room.status}">${isAvailable ? 'Trống' : 'Đã đặt'}</span>
        </div>
        <div class="room-details">
          <p class="room-type">${room.type}</p>
          <p class="room-price">${formatVND(room.price)} / đêm</p>
          ${bookingDetailsHTML}
        </div>
      </div>
      <div class="room-actions" style="margin-top: 15px;">
        ${isAvailable 
          ? `<button class="btn btn-primary btn-block book-btn" onclick="openBookingModal('${room.id}')">Đặt Phòng Ngay</button>`
          : `<button class="btn btn-danger btn-block cancel-btn" onclick="cancelBooking('${room.id}')">Hủy Đặt Phòng</button>`
        }
      </div>
    `;
    roomsGrid.appendChild(card);
  });
}

// Lắng nghe sự kiện tìm kiếm và lọc
searchInput.addEventListener('input', renderRooms);
statusFilter.addEventListener('change', renderRooms);

// Điều khiển Modal
window.openBookingModal = function(roomId) {
  const room = allRooms.find(r => r.id === roomId);
  if (!room) return;

  modalRoomId.value = room.id;
  modalTitle.textContent = `Đặt ${room.name}`;
  summaryPrice.textContent = formatVND(room.price);
  
  // Reset ngày về mặc định khi mở modal
  checkInInput.value = today;
  checkOutInput.value = tomorrow;
  
  updateSummaryTotal();
  bookingModal.classList.add('active');
};

function closeModal() {
  bookingModal.classList.remove('active');
  bookingForm.reset();
}

closeModalBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
  if (e.target === bookingModal) {
    closeModal();
  }
});

// Xử lý gửi form đặt phòng
bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const bookingData = {
    roomId: modalRoomId.value,
    customerName: document.getElementById('customer-name').value,
    customerEmail: document.getElementById('customer-email').value,
    checkInDate: checkInInput.value,
    checkOutDate: checkOutInput.value
  };

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      closeModal();
    } else {
      alert(result.message || 'Đã xảy ra lỗi khi đặt phòng.');
    }
  } catch (error) {
    console.error('Lỗi kết nối API:', error);
    alert('Không thể kết nối tới máy chủ.');
  }
});

// Xử lý hủy đặt phòng
window.cancelBooking = async function(roomId) {
  if (!confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
    return;
  }

  try {
    const response = await fetch(`/api/bookings/${roomId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
    } else {
      alert(result.message || 'Đã xảy ra lỗi khi hủy đặt phòng.');
    }
  } catch (error) {
    console.error('Lỗi kết nối API:', error);
    alert('Không thể kết nối tới máy chủ.');
  }
};
```

---