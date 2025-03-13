/**
 * Скрипт для страницы бронирования
 * Гостиница "Лесной дворик"
 */
document.addEventListener("DOMContentLoaded", function() {
    // Получение ссылок на элементы формы
    const bookingForm = document.getElementById("booking-form");
    const checkInDate = document.getElementById("check-in-date");
    const checkOutDate = document.getElementById("check-out-date");
    const roomType = document.getElementById("room-type");
    const adults = document.getElementById("adults");
    const children = document.getElementById("children");
    const specialRequests = document.getElementById("special-requests");
    const priceSummary = document.getElementById("price-summary");
    const roomTypeInfo = document.getElementById("room-type-info");
    const formSubmitBtn = document.getElementById("booking-submit");
    const totalPriceInput = document.getElementById("total-price");
    const csrfToken = document.getElementById("csrf-token");
    
    // Константы для расчета цен
    const BASE_PRICES = {
        'econom': 2500,
        'standard': 3500,
        'family': 5000,
        'comfort': 4500,
        'lux': 7000
    };
    
    // Форматирование даты в формат YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };
    
    // Получение сегодняшней даты
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Установка минимальной даты заезда (сегодня)
    checkInDate.min = formatDate(today);
    
    // Функция для расчета количества дней между датами
    const getDaysDifference = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    
    // Функция расчета стоимости
    const calculatePrice = () => {
        if (!checkInDate.value || !checkOutDate.value || !roomType.value) {
            return 0;
        }
        
        const days = getDaysDifference(checkInDate.value, checkOutDate.value);
        if (days <= 0) {
            return 0;
        }
        
        const basePrice = BASE_PRICES[roomType.value] || 0;
        const adultsCount = parseInt(adults.value) || 1;
        const childrenCount = parseInt(children.value) || 0;
        
        // Базовая стоимость за номер
        let totalPrice = basePrice * days;
        
        // Доплата за дополнительных взрослых (если больше 2)
        if (adultsCount > 2) {
            totalPrice += (adultsCount - 2) * 1000 * days;
        }
        
        // Доплата за детей (если есть)
        if (childrenCount > 0) {
            totalPrice += childrenCount * 500 * days;
        }
        
        return totalPrice;
    };
    
    // Обновление информации о стоимости
    const updatePriceSummary = () => {
        const price = calculatePrice();
        
        if (price > 0) {
            const days = getDaysDifference(checkInDate.value, checkOutDate.value);
            const basePrice = BASE_PRICES[roomType.value] || 0;
            
            let html = `
                <div class="price-details">
                    <div class="price-row">
                        <span>Базовая стоимость номера:</span>
                        <span>${basePrice} ₽/сутки</span>
                    </div>
                    <div class="price-row">
                        <span>Количество суток:</span>
                        <span>${days}</span>
                    </div>
                    <div class="price-row">
                        <span>Количество гостей:</span>
                        <span>${adults.value} взр. ${children.value > 0 ? '+ ' + children.value + ' дет.' : ''}</span>
                    </div>
                    <div class="price-row total">
                        <span>Итоговая стоимость:</span>
                        <span>${price} ₽</span>
                    </div>
                </div>
            `;
            
            priceSummary.innerHTML = html;
            priceSummary.classList.remove("hidden");
            
            // Обновляем скрытое поле с общей стоимостью
            if (totalPriceInput) {
                totalPriceInput.value = price;
            }
        } else {
            priceSummary.innerHTML = "";
            priceSummary.classList.add("hidden");
            
            if (totalPriceInput) {
                totalPriceInput.value = "0";
            }
        }
    };
    
    // Проверка доступности номера на выбранные даты
    const checkRoomAvailability = async () => {
        if (!checkInDate.value || !checkOutDate.value || !roomType.value) {
            return true; // Не проверяем, если не все данные заполнены
        }
        
        try {
            const response = await fetch('/api/check-availability.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    check_in_date: checkInDate.value,
                    check_out_date: checkOutDate.value,
                    room_type: roomType.value
                })
            });
            
            const data = await response.json();
            
            if (!data.available) {
                alert(`К сожалению, номер типа "${roomType.options[roomType.selectedIndex].text}" недоступен на выбранные даты. Пожалуйста, выберите другие даты или тип номера.`);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка при проверке доступности:', error);
            return true; // В случае ошибки разрешаем продолжить
        }
    };
    
    // Обновление информации о типе номера
    const updateRoomTypeInfo = () => {
        if (!roomType.value) {
            roomTypeInfo.innerHTML = "";
            return;
        }
        
        const roomTypes = {
            'econom': {
                name: 'Эконом',
                description: 'Уютный номер с основными удобствами. Подходит для 1-2 гостей.',
                amenities: ['Односпальная или двуспальная кровать', 'Телевизор', 'Шкаф', 'Общая ванная комната']
            },
            'standard': {
                name: 'Стандарт',
                description: 'Комфортабельный номер со всеми необходимыми удобствами. Идеален для пары.',
                amenities: ['Двуспальная кровать', 'Телевизор', 'Кондиционер', 'Холодильник', 'Отдельная ванная комната']
            },
            'comfort': {
                name: 'Комфорт',
                description: 'Улучшенный номер с дополнительными удобствами и большей площадью.',
                amenities: ['Двуспальная кровать', 'Телевизор', 'Кондиционер', 'Холодильник', 'Мини-бар', 'Просторная ванная комната']
            },
            'family': {
                name: 'Семейный',
                description: 'Просторный номер для семейного отдыха с детьми.',
                amenities: ['Двуспальная кровать', 'Диван-кровать', 'Телевизор', 'Кондиционер', 'Холодильник', 'Отдельная ванная комната']
            },
            'lux': {
                name: 'Люкс',
                description: 'Роскошный номер с панорамным видом и всеми удобствами для комфортного отдыха.',
                amenities: ['Большая двуспальная кровать', 'Гостиная зона', 'Телевизор', 'Кондиционер', 'Холодильник', 'Мини-бар', 'Джакузи', 'Балкон с видом']
            }
        };
        
        const selectedRoom = roomTypes[roomType.value];
        
        if (selectedRoom) {
            let amenitiesList = '';
            selectedRoom.amenities.forEach(item => {
                amenitiesList += `<li>${item}</li>`;
            });
            
            roomTypeInfo.innerHTML = `
                <div class="room-info">
                    <h3>${selectedRoom.name}</h3>
                    <p>${selectedRoom.description}</p>
                    <h4>Удобства:</h4>
                    <ul>${amenitiesList}</ul>
                    <p class="price-note">Базовая стоимость: ${BASE_PRICES[roomType.value]} ₽/сутки</p>
                </div>
            `;
        } else {
            roomTypeInfo.innerHTML = "";
        }
    };
    
    // Обработчики событий для полей формы
    checkInDate.addEventListener("change", function() {
        // Устанавливаем минимальную дату выезда на следующий день после заезда
        if (this.value) {
            const nextDay = new Date(this.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutDate.min = formatDate(nextDay);
            
            // Если дата выезда раньше новой минимальной даты, корректируем её
            if (checkOutDate.value && new Date(checkOutDate.value) < nextDay) {
                checkOutDate.value = formatDate(nextDay);
            }
        }
        
        updatePriceSummary();
    });
    
    checkOutDate.addEventListener("change", updatePriceSummary);
    roomType.addEventListener("change", function() {
        updateRoomTypeInfo();
        updatePriceSummary();
    });
    adults.addEventListener("change", updatePriceSummary);
    children.addEventListener("change", updatePriceSummary);
    
    // Инициализация CSRF-токена
    if (!csrfToken.value) {
        csrfToken.value = generateCSRFToken();
    }
    
    // Генерация CSRF-токена
    function generateCSRFToken() {
        return Array(32).fill(0).map(() => Math.random().toString(36).charAt(2)).join('');
    }
    
    // Обработчик отправки формы
    if (bookingForm) {
        bookingForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            // Проверка заполнения обязательных полей
            const requiredFields = bookingForm.querySelectorAll("[required]");
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add("error");
                } else {
                    field.classList.remove("error");
                }
            });
            
            if (!isValid) {
                alert("Пожалуйста, заполните все обязательные поля.");
                return;
            }
            
            // Проверка доступности номера
            const isAvailable = await checkRoomAvailability();
            if (!isAvailable) {
                return;
            }
            
            // Блокируем кнопку отправки
            if (formSubmitBtn) {
                formSubmitBtn.disabled = true;
                formSubmitBtn.textContent = "Отправка...";
            }
            
            // Отправка формы через AJAX
            const formData = new FormData(bookingForm);
            
            try {
                const response = await fetch(bookingForm.action, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Успешное бронирование
                    if (result.redirect) {
                        window.location.href = result.redirect;
                    } else {
                        alert(result.message);
                        bookingForm.reset();
                    }
                } else {
                    // Ошибка бронирования
                    if (result.errors && result.errors.length > 0) {
                        alert("Ошибки при бронировании:\n" + result.errors.join("\n"));
                    } else {
                        alert(result.message || "Произошла ошибка при бронировании. Пожалуйста, попробуйте позже.");
                    }
                }
            } catch (error) {
                console.error("Ошибка при отправке формы:", error);
                alert("Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.");
            } finally {
                // Разблокируем кнопку отправки
                if (formSubmitBtn) {
                    formSubmitBtn.disabled = false;
                    formSubmitBtn.textContent = "Забронировать";
                }
            }
        });
    }
    
    // Инициализация при загрузке страницы
    updateRoomTypeInfo();
    updatePriceSummary();
});
