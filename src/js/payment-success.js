/**
 * JavaScript для страницы успешной оплаты
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    const paymentId = urlParams.get('payment_id');
    const amount = urlParams.get('amount');
    
    // Если есть ID бронирования, отображаем его
    if (bookingId) {
        document.getElementById('bookingId').textContent = bookingId;
    }
    
    // Если есть сумма, отображаем ее
    if (amount) {
        document.getElementById('paymentAmount').textContent = parseFloat(amount).toLocaleString('ru-RU') + ' ₽';
    }
    
    // Устанавливаем текущую дату
    const now = new Date();
    document.getElementById('paymentDate').textContent = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU');
    
    // Если есть ID платежа, отправляем запрос на сервер для получения деталей платежа
    if (paymentId) {
        fetchPaymentDetails(paymentId);
    }
    
    /**
     * Получение деталей платежа с сервера
     * 
     * @param {string} paymentId ID платежа
     */
    function fetchPaymentDetails(paymentId) {
        fetch('/api/get-payment.php?payment_id=' + paymentId)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных платежа');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.payment) {
                    updatePaymentDetails(data.payment);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }
    
    /**
     * Обновление деталей платежа на странице
     * 
     * @param {object} payment Данные платежа
     */
    function updatePaymentDetails(payment) {
        if (payment.booking_id) {
            document.getElementById('bookingId').textContent = payment.booking_id;
        }
        
        if (payment.amount) {
            document.getElementById('paymentAmount').textContent = parseFloat(payment.amount).toLocaleString('ru-RU') + ' ₽';
        }
        
        if (payment.created_at) {
            const date = new Date(payment.created_at);
            document.getElementById('paymentDate').textContent = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU');
        }
    }
}); 