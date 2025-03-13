/**
 * Скрипт для страницы бронирования
 * Гостиница "Лесной дворик"
 */
document.addEventListener("DOMContentLoaded", function() {
    // Установка минимальной даты заезда (сегодня)
    const today = new Date();
    const checkInDate = document.getElementById("check-in-date");
    const checkOutDate = document.getElementById("check-out-date");
    
    // Форматирование даты в формат YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    
    // Установка минимальной даты заезда (сегодня)
    checkInDate.min = formatDate(today);
    
    // Обработчик изменения даты заезда
    checkInDate.addEventListener("change", function() {
        if (this.value) {
            // Установка минимальной даты выезда (дата заезда + 1 день)
            const nextDay = new Date(this.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutDate.min = formatDate(nextDay);
            
            // Если дата выезда меньше минимальной, устанавливаем минимальную
            if (checkOutDate.value && new Date(checkOutDate.value) < nextDay) {
                checkOutDate.value = formatDate(nextDay);
            }
        }
    });
    
    // Валидация формы перед отправкой
    document.getElementById("booking-form").addEventListener("submit", function(e) {
        const checkIn = new Date(checkInDate.value);
        const checkOut = new Date(checkOutDate.value);
        
        if (checkOut <= checkIn) {
            e.preventDefault();
            alert("Дата выезда должна быть позже даты заезда");
            return false;
        }
        
        return true;
    });
});
