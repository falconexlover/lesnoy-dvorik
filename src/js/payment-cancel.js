/**
 * JavaScript для страницы отмены платежа
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    
    // Если есть ID бронирования, отображаем его
    if (bookingId) {
        document.getElementById('bookingId').textContent = bookingId;
    }
}); 