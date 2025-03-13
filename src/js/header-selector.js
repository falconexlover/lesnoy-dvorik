/**
 * Скрипт для выбора и применения варианта хедера
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Обработка кнопок выбора варианта хедера
    const applyButtons = document.querySelectorAll('.apply-button');
    
    if (applyButtons.length > 0) {
        applyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const variant = this.getAttribute('data-variant');
                applyHeaderVariant(variant);
            });
        });
    }
    
    // Обработка кнопки возврата на сайт
    const backButton = document.getElementById('backButton');
    
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Проверка и применение сохраненного варианта хедера при загрузке страницы
    const savedVariant = localStorage.getItem('headerVariant');
    
    if (savedVariant && document.querySelector('header')) {
        applyHeaderVariantToCurrentPage(savedVariant);
    }
});

/**
 * Применяет выбранный вариант хедера и сохраняет выбор
 * @param {string} variant - Номер варианта хедера (1, 2 или 3)
 */
function applyHeaderVariant(variant) {
    // Сохраняем выбор в localStorage
    localStorage.setItem('headerVariant', variant);
    
    // Показываем уведомление пользователю
    showNotification(`Вариант ${variant} успешно применен!`);
    
    // Перенаправляем на главную страницу через 1.5 секунды
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1500);
}

/**
 * Применяет выбранный вариант хедера к текущей странице
 * @param {string} variant - Номер варианта хедера (1, 2 или 3)
 */
function applyHeaderVariantToCurrentPage(variant) {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    // Удаляем все классы вариантов
    header.classList.remove('header-variant-1', 'header-variant-2', 'header-variant-3');
    
    // Добавляем класс выбранного варианта
    header.classList.add(`header-variant-${variant}`);
    
    // Обновляем структуру хедера в зависимости от варианта
    updateHeaderStructure(header, variant);
}

/**
 * Обновляет структуру хедера в зависимости от выбранного варианта
 * @param {HTMLElement} header - Элемент хедера
 * @param {string} variant - Номер варианта хедера (1, 2 или 3)
 */
function updateHeaderStructure(header, variant) {
    // Получаем текущее содержимое хедера
    const currentContent = header.innerHTML;
    
    // В зависимости от варианта, обновляем структуру
    switch (variant) {
        case '1':
            // Вариант 1: Современный минималистичный
            if (!header.querySelector('.header-container')) {
                header.innerHTML = `
                    <div class="header-container">
                        <div class="logo">
                            <a href="index.html">
                                <img src="assets/images/logo.png" alt="Лесной дворик" width="150" height="50">
                            </a>
                        </div>
                        ${getNavigationHTML()}
                        <div class="booking-button">
                            <a href="pages/booking.html" class="btn"><i class="fas fa-calendar-check"></i> Забронировать</a>
                        </div>
                        <button class="mobile-menu-toggle" aria-label="Открыть меню" aria-expanded="false" aria-controls="main-menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                    <div class="menu-overlay"></div>
                `;
            }
            break;
            
        case '2':
            // Вариант 2: Двухуровневый хедер
            if (!header.querySelector('.header-top')) {
                header.innerHTML = `
                    <div class="header-top">
                        <div class="header-top-container">
                            <div class="contact-info">
                                <a href="tel:+79991234567"><i class="fas fa-phone"></i> +7 (999) 123-45-67</a>
                                <a href="mailto:info@lesnoy-dvorik.ru"><i class="fas fa-envelope"></i> info@lesnoy-dvorik.ru</a>
                            </div>
                            <div class="social-links">
                                <a href="#" aria-label="Вконтакте"><i class="fab fa-vk"></i></a>
                                <a href="#" aria-label="Telegram"><i class="fab fa-telegram"></i></a>
                                <a href="#" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                    <div class="header-main">
                        <div class="header-main-container">
                            <div class="logo">
                                <a href="index.html">
                                    <img src="assets/images/logo.png" alt="Лесной дворик" width="150" height="50">
                                </a>
                            </div>
                            ${getNavigationHTML()}
                            <div class="booking-button">
                                <a href="pages/booking.html" class="btn"><i class="fas fa-calendar-check"></i> Забронировать</a>
                            </div>
                            <button class="mobile-menu-toggle" aria-label="Открыть меню" aria-expanded="false" aria-controls="main-menu">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                    <div class="menu-overlay"></div>
                `;
            }
            break;
            
        case '3':
            // Вариант 3: Центрированное меню
            if (!header.querySelector('.header-container') || !header.querySelector('.header-container').classList.contains('centered')) {
                header.innerHTML = `
                    <div class="header-container centered">
                        <div class="logo">
                            <a href="index.html">
                                <img src="assets/images/logo.png" alt="Лесной дворик" width="150" height="50">
                            </a>
                        </div>
                        ${getNavigationHTML()}
                        <div class="booking-button">
                            <a href="pages/booking.html" class="btn"><i class="fas fa-calendar-check"></i> Забронировать</a>
                        </div>
                        <button class="mobile-menu-toggle" aria-label="Открыть меню" aria-expanded="false" aria-controls="main-menu">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                    <div class="menu-overlay"></div>
                `;
            }
            break;
    }
    
    // Инициализируем обработчики событий для мобильного меню
    initMobileMenuHandlers();
}

/**
 * Возвращает HTML-код для навигационного меню
 * @returns {string} HTML-код навигационного меню
 */
function getNavigationHTML() {
    return `
        <nav class="main-menu">
            <ul>
                <li><a href="#about">О нас</a></li>
                <li class="dropdown">
                    <a href="pages/hotel.html">Гостиница</a>
                    <div class="dropdown-content">
                        <a href="pages/hotel.html#econom">Эконом</a>
                        <a href="pages/hotel.html#standard">Стандарт</a>
                        <a href="pages/hotel.html#family">Семейные</a>
                        <a href="pages/hotel.html#comfort">Комфорт</a>
                        <a href="pages/hotel.html#lux">Люкс</a>
                    </div>
                </li>
                <li><a href="pages/sauna.html">Сауна</a></li>
                <li><a href="pages/banquet.html">Конференц-зал</a></li>
                <li><a href="pages/special.html">Спецпредложения</a></li>
                <li><a href="pages/reviews.html">Отзывы</a></li>
                <li><a href="pages/info.html">Полезная информация</a></li>
                <li><a href="pages/contacts.html">Контакты</a></li>
                <li><a href="pages/gallery.html">Галерея</a></li>
            </ul>
        </nav>
    `;
}

/**
 * Инициализирует обработчики событий для мобильного меню
 */
function initMobileMenuHandlers() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (mobileMenuToggle && mainMenu && menuOverlay) {
        // Удаляем существующие обработчики, чтобы избежать дублирования
        const newMobileMenuToggle = mobileMenuToggle.cloneNode(true);
        mobileMenuToggle.parentNode.replaceChild(newMobileMenuToggle, mobileMenuToggle);
        
        const newMenuOverlay = menuOverlay.cloneNode(true);
        menuOverlay.parentNode.replaceChild(newMenuOverlay, menuOverlay);
        
        // Добавляем новые обработчики
        newMobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainMenu.classList.toggle('active');
            newMenuOverlay.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        newMenuOverlay.addEventListener('click', function() {
            newMobileMenuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
            this.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    }
    
    // Обработка выпадающего меню на мобильных устройствах
    if (dropdowns.length > 0) {
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            
            // Удаляем существующие обработчики
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // Добавляем новые обработчики
            newLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });
    }
}

/**
 * Показывает уведомление пользователю
 * @param {string} message - Текст уведомления
 */
function showNotification(message) {
    // Проверяем, существует ли уже уведомление
    let notification = document.querySelector('.header-notification');
    
    if (!notification) {
        // Создаем элемент уведомления
        notification = document.createElement('div');
        notification.className = 'header-notification';
        document.body.appendChild(notification);
        
        // Добавляем стили для уведомления
        const style = document.createElement('style');
        style.textContent = `
            .header-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: var(--primary-color);
                color: white;
                padding: 15px 25px;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .header-notification.active {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Устанавливаем текст уведомления
    notification.textContent = message;
    
    // Показываем уведомление
    setTimeout(() => {
        notification.classList.add('active');
    }, 100);
    
    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('active');
        
        // Удаляем элемент через 0.3 секунды после скрытия
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 