/**
 * Скрипт для работы формы бронирования
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('booking-form');
    
    if (!bookingForm) return;
    
    // Настройка полей даты
    setupDateFields();
    
    // Валидация и обработка формы
    setupFormValidation();
    
    // Инициализация модального окна бронирования
    setupBookingModal();
    
    // Обработка мобильной кнопки бронирования
    setupMobileBookingButton();
    
    /**
     * Настройка полей даты
     */
    function setupDateFields() {
        const checkInDate = document.getElementById('check-in-date');
        const checkOutDate = document.getElementById('check-out-date');
        
        if (!checkInDate || !checkOutDate) return;
        
        // Устанавливаем минимальную дату как сегодня
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Форматируем дату для поля ввода (YYYY-MM-DD)
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Устанавливаем минимальные значения
        checkInDate.min = formatDate(today);
        checkOutDate.min = formatDate(tomorrow);
        
        // При изменении даты заезда обновляем минимальную дату выезда
        checkInDate.addEventListener('change', function() {
            if (!this.value) return;
            
            const selectedDate = new Date(this.value);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            checkOutDate.min = formatDate(nextDay);
            
            // Если текущая дата выезда меньше новой минимальной даты
            if (checkOutDate.value && new Date(checkOutDate.value) <= selectedDate) {
                checkOutDate.value = formatDate(nextDay);
            }
        });
        
        // Сбрасываем форму при загрузке
        bookingForm.reset();
    }
    
    /**
     * Настройка валидации формы
     */
    function setupFormValidation() {
        // Добавляем слушатель события отправки формы
        bookingForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Проверка обязательных полей
            const requiredFields = bookingForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });
            
            // Если форма не прошла валидацию, предотвращаем отправку
            if (!isValid) {
                e.preventDefault();
                
                // Показываем сообщение об ошибке
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = 'Пожалуйста, заполните все обязательные поля корректно.';
                
                // Удаляем предыдущее сообщение об ошибке, если оно есть
                const existingError = bookingForm.querySelector('.error-message');
                if (existingError) {
                    bookingForm.removeChild(existingError);
                }
                
                // Добавляем сообщение об ошибке в начало формы
                bookingForm.insertBefore(errorMessage, bookingForm.firstChild);
                
                // Прокручиваем к началу формы
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // При успешной валидации показываем модальное окно с подтверждением
                e.preventDefault(); // Предотвращаем отправку формы
                showBookingConfirmation();
            }
        });
        
        // Добавляем слушатели события изменения для полей с валидацией
        const validatedFields = bookingForm.querySelectorAll('input, select, textarea');
        validatedFields.forEach(field => {
            field.addEventListener('input', function() {
                validateField(this);
            });
            
            field.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
    
    /**
     * Валидация поля формы
     */
    function validateField(field) {
        // Удаляем предыдущие сообщения об ошибках
        const parent = field.parentElement;
        const errorSpan = parent.querySelector('.field-error');
        if (errorSpan) {
            parent.removeChild(errorSpan);
        }
        
        // Сбрасываем класс ошибки
        field.classList.remove('is-invalid');
        
        let isValid = true;
        let errorMessage = '';
        
        // Проверка на заполненность для обязательных полей
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        } 
        // Валидация email
        else if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value.trim())) {
                isValid = false;
                errorMessage = 'Пожалуйста, введите корректный email';
            }
        }
        // Валидация телефона
        else if (field.id === 'phone' && field.value.trim()) {
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            if (!phoneRegex.test(field.value.trim())) {
                isValid = false;
                errorMessage = 'Пожалуйста, введите корректный номер телефона';
            }
        }
        
        // Если поле не прошло валидацию, добавляем сообщение об ошибке
        if (!isValid) {
            field.classList.add('is-invalid');
            
            const span = document.createElement('span');
            span.className = 'field-error';
            span.textContent = errorMessage;
            parent.appendChild(span);
        }
        
        return isValid;
    }
    
    /**
     * Настройка модального окна бронирования
     */
    function setupBookingModal() {
        // Создаем модальное окно, если его еще нет
        if (!document.getElementById('booking-confirmation-modal')) {
            const modal = document.createElement('div');
            modal.id = 'booking-confirmation-modal';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <h2>Подтверждение бронирования</h2>
                    <div id="booking-details"></div>
                    <div class="modal-actions">
                        <button id="confirm-booking" class="btn btn-primary">Подтвердить</button>
                        <button id="cancel-booking" class="btn btn-outline">Отмена</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Закрытие модального окна
            const closeBtn = modal.querySelector('.modal-close');
            const cancelBtn = modal.querySelector('#cancel-booking');
            
            [closeBtn, cancelBtn].forEach(btn => {
                btn.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            });
            
            // Подтверждение бронирования
            const confirmBtn = modal.querySelector('#confirm-booking');
            confirmBtn.addEventListener('click', function() {
                // Здесь можно добавить AJAX-запрос для отправки данных
                // или просто отправить форму
                modal.style.display = 'none';
                bookingForm.submit();
            });
            
            // Закрытие по клику вне модального окна
            window.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Показать модальное окно с подтверждением бронирования
     */
    function showBookingConfirmation() {
        const modal = document.getElementById('booking-confirmation-modal');
        const detailsContainer = document.getElementById('booking-details');
        
        if (!modal || !detailsContainer) return;
        
        // Собираем данные из формы
        const checkInDate = formatDateForDisplay(document.getElementById('check-in-date').value);
        const checkOutDate = formatDateForDisplay(document.getElementById('check-out-date').value);
        const guests = document.getElementById('guests').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        
        // Формируем HTML для деталей бронирования
        let detailsHTML = `
            <p><strong>Дата заезда:</strong> ${checkInDate}</p>
            <p><strong>Дата выезда:</strong> ${checkOutDate}</p>
            <p><strong>Количество гостей:</strong> ${guests}</p>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Телефон:</strong> ${phone}</p>
        `;
        
        detailsContainer.innerHTML = detailsHTML;
        
        // Показываем модальное окно
        modal.style.display = 'block';
    }
    
    /**
     * Форматирование даты для отображения
     */
    function formatDateForDisplay(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    /**
     * Настройка мобильной кнопки бронирования
     */
    function setupMobileBookingButton() {
        const mobileBookingBtn = document.querySelector('.mobile-booking-button');
        
        if (!mobileBookingBtn) return;
        
        mobileBookingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Прокручиваем к форме бронирования
            const bookingSection = document.querySelector('.booking-section');
            
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Если секция бронирования не найдена, прокручиваем к форме
                bookingForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}); 