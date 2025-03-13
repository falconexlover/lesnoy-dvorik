/**
 * JavaScript для страницы оплаты
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы страницы
    const loadingDetails = document.getElementById('loadingDetails');
    const errorDetails = document.getElementById('errorDetails');
    const bookingInfo = document.getElementById('bookingInfo');
    const paymentMethods = document.getElementById('paymentMethods');
    const payButton = document.getElementById('payButton');
    const agreementCheckbox = document.getElementById('agreement');
    
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('booking_id');
    const token = urlParams.get('token');
    
    // Проверяем наличие необходимых параметров
    if (!bookingId || !token) {
        showError('Отсутствуют необходимые параметры для оплаты');
        return;
    }
    
    // Загружаем информацию о бронировании
    fetchBookingDetails(bookingId, token);
    
    // Обработчик изменения чекбокса согласия
    agreementCheckbox.addEventListener('change', function() {
        payButton.disabled = !this.checked;
    });
    
    // Обработчик клика на кнопку оплаты
    payButton.addEventListener('click', function() {
        if (agreementCheckbox.checked) {
            processPayment(bookingId, token);
        }
    });
    
    // Обработчик выбора метода оплаты
    const paymentMethodInputs = document.querySelectorAll('input[name="payment_method"]');
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Удаляем активный класс у всех методов
            document.querySelectorAll('.payment__method').forEach(method => {
                method.classList.remove('payment__method--active');
            });
            
            // Добавляем активный класс выбранному методу
            this.closest('.payment__method').classList.add('payment__method--active');
        });
    });
    
    /**
     * Загрузка информации о бронировании
     * 
     * @param {number} bookingId ID бронирования
     * @param {string} token Токен доступа
     */
    function fetchBookingDetails(bookingId, token) {
        fetch(`/api/get-booking.php?booking_id=${bookingId}&token=${token}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных бронирования');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.booking) {
                    displayBookingDetails(data.booking);
                } else {
                    showError(data.error || 'Ошибка при получении данных бронирования');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showError('Ошибка при получении данных бронирования');
            });
    }
    
    /**
     * Отображение информации о бронировании
     * 
     * @param {object} booking Данные бронирования
     */
    function displayBookingDetails(booking) {
        // Проверяем статус оплаты
        if (booking.payment_status === 'paid') {
            showError('Это бронирование уже оплачено');
            return;
        }
        
        // Заполняем информацию о бронировании
        document.getElementById('bookingId').textContent = booking.id;
        document.getElementById('guestName').textContent = booking.name;
        
        // Форматируем даты
        const checkInDate = new Date(booking.check_in_date);
        const checkOutDate = new Date(booking.check_out_date);
        document.getElementById('stayDates').textContent = 
            `${checkInDate.toLocaleDateString('ru-RU')} - ${checkOutDate.toLocaleDateString('ru-RU')}`;
        
        document.getElementById('roomType').textContent = formatRoomType(booking.room_type);
        
        // Форматируем количество гостей
        const adultsCount = parseInt(booking.adults);
        const childrenCount = parseInt(booking.children);
        let guestsText = `${adultsCount} ${declOfNum(adultsCount, ['взрослый', 'взрослых', 'взрослых'])}`;
        
        if (childrenCount > 0) {
            guestsText += `, ${childrenCount} ${declOfNum(childrenCount, ['ребенок', 'ребенка', 'детей'])}`;
        }
        
        document.getElementById('guestsCount').textContent = guestsText;
        
        // Форматируем стоимость
        document.getElementById('totalPrice').textContent = 
            parseFloat(booking.total_price).toLocaleString('ru-RU') + ' ₽';
        
        // Скрываем загрузку и показываем информацию
        loadingDetails.style.display = 'none';
        bookingInfo.style.display = 'block';
        paymentMethods.style.display = 'block';
    }
    
    /**
     * Отображение ошибки
     * 
     * @param {string} message Сообщение об ошибке
     */
    function showError(message) {
        loadingDetails.style.display = 'none';
        errorDetails.style.display = 'block';
        errorDetails.querySelector('p').textContent = message;
    }
    
    /**
     * Обработка платежа
     * 
     * @param {number} bookingId ID бронирования
     * @param {string} token Токен доступа
     */
    function processPayment(bookingId, token) {
        // Получаем выбранный метод оплаты
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        
        // Блокируем кнопку оплаты
        payButton.disabled = true;
        payButton.textContent = 'Обработка платежа...';
        
        // Получаем сумму платежа
        const totalPriceText = document.getElementById('totalPrice').textContent;
        const amount = parseFloat(totalPriceText.replace(/[^\d.,]/g, '').replace(',', '.'));
        
        // Отправляем запрос на создание платежа
        fetch('/api/process-payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                booking_id: bookingId,
                amount: amount,
                payment_method: paymentMethod,
                return_url: `${window.location.origin}/payment-success?booking_id=${bookingId}`,
                cancel_url: `${window.location.origin}/payment-cancel?booking_id=${bookingId}`
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при создании платежа');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.payment && data.payment.payment_url) {
                // Перенаправляем на страницу оплаты
                window.location.href = data.payment.payment_url;
            } else {
                showError(data.error || 'Ошибка при создании платежа');
                payButton.disabled = false;
                payButton.textContent = 'Оплатить';
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showError('Ошибка при создании платежа');
            payButton.disabled = false;
            payButton.textContent = 'Оплатить';
        });
    }
    
    /**
     * Форматирование типа номера
     * 
     * @param {string} roomType Тип номера
     * @return {string} Отформатированный тип номера
     */
    function formatRoomType(roomType) {
        const roomTypes = {
            'standard': 'Стандартный',
            'comfort': 'Комфорт',
            'luxury': 'Люкс',
            'family': 'Семейный'
        };
        
        return roomTypes[roomType] || roomType;
    }
    
    /**
     * Склонение существительных после числительных
     * 
     * @param {number} number Число
     * @param {array} words Массив слов для склонения [1, 2, 5]
     * @return {string} Склоненное слово
     */
    function declOfNum(number, words) {
        return words[(number % 100 > 4 && number % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? Math.abs(number) % 10 : 5]];
    }
}); 