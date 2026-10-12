const { test, expect } = require('@playwright/test');

test.describe('Hệ Thống Quản Lý Đặt Phòng Khách Sạn - E2E Tests', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Truy cập trang chủ trước mỗi test case
    await page.goto(BASE_URL);
  });

  test('Hiển thị danh sách phòng đầy đủ ban đầu', async ({ page }) => {
    // Kiểm tra tiêu đề trang
    await expect(page).toHaveTitle(/Hệ Thống Đặt Phòng Khách Sạn Real-time/);

    // Kiểm tra danh sách phòng hiển thị đủ 5 phòng mẫu
    const roomCards = page.locator('.room-card');
    await expect(roomCards).toHaveCount(5);
  });

  test('Tìm kiếm và lọc phòng theo trạng thái', async ({ page }) => {
    // Tìm kiếm phòng Deluxe 101
    await page.fill('#search-input', 'Deluxe 101');
    let roomCards = page.locator('.room-card');
    await expect(roomCards).toHaveCount(1);
    await expect(page.locator('.room-title').first()).toHaveText('Phòng Deluxe 101');

    // Reset tìm kiếm
    await page.fill('#search-input', '');

    // Lọc phòng trống
    await page.selectOption('#status-filter', 'available');
    roomCards = page.locator('.room-card');
    await expect(roomCards).toHaveCount(5); // Ban đầu tất cả đều trống
  });

  test('Thực hiện đặt phòng thành công', async ({ page }) => {
    // Click nút đặt phòng của phòng 101
    const firstRoomCard = page.locator('.room-card[data-room-id="101"]');
    await firstRoomCard.locator('.book-btn').click();

    // Kiểm tra modal hiển thị
    const modal = page.locator('#booking-modal');
    await expect(modal).toHaveClass(/active/);

    // Điền thông tin đặt phòng
    await page.fill('#customer-name', 'Nguyễn Văn A');
    await page.fill('#customer-email', 'nguyenvana@gmail.com');

    // Chấp nhận hộp thoại alert thành công
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Đặt phòng thành công!');
      await dialog.accept();
    });

    // Submit form
    await page.click('#submit-booking-btn');

    // Đợi modal đóng
    await expect(modal).not.toHaveClass(/active/);

    // Kiểm tra trạng thái phòng 101 đã chuyển sang "Đã đặt" và hiển thị nút "Hủy Đặt Phòng"
    const updatedRoomCard = page.locator('.room-card[data-room-id="101"]');
    await expect(updatedRoomCard.locator('.room-badge')).toHaveText('Đã đặt');
    await expect(updatedRoomCard.locator('.cancel-btn')).toBeVisible();
    await expect(updatedRoomCard.locator('.booking-info')).toContainText('Nguyễn Văn A');
  });

  test('Thực hiện hủy đặt phòng thành công', async ({ page }) => {
    // Đặt phòng trước để có phòng hủy
    const roomCard = page.locator('.room-card[data-room-id="102"]');
    await roomCard.locator('.book-btn').click();
    await page.fill('#customer-name', 'Trần Thị B');
    await page.fill('#customer-email', 'tranthib@gmail.com');
    
    // Chấp nhận alert đặt phòng thành công
    const dialogHandler1 = async dialog => {
      await dialog.accept();
    };
    page.on('dialog', dialogHandler1);
    await page.click('#submit-booking-btn');
    page.off('dialog', dialogHandler1);

    // Thực hiện hủy đặt phòng
    // Chấp nhận confirm dialog và alert thông báo thành công
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        expect(dialog.message()).toContain('Bạn có chắc chắn muốn hủy đặt phòng này không?');