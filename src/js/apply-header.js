/**
 * Скрипт для применения варианта хедера ко всем страницам
 * Гостиница "Лесной дворик"
 */

// Получаем выбранный вариант хедера (по умолчанию вариант 2)
const headerVariant = localStorage.getItem('headerVariant') || '2';

// Функция для применения выбранного варианта хедера
function applyHeaderVariant() {
    const header = document.querySelector('header');
    
    if (!header) return;
    
    // Определяем, находимся ли мы на главной странице или в подкаталоге
    const isMainPage = !window.location.pathname.includes('/pages/');
    const rootPath = isMainPage ? '' : '../';
    
    // Удаляем все классы вариантов
    header.classList.remove('header-variant-1', 'header-variant-2', 'header-variant-3');
    
    // Добавляем класс выбранного варианта
    header.classList.add('header-variant-' + headerVariant);
    
    // Обновляем структуру хедера в зависимости от варианта
    if (headerVariant === '1') {
        applyHeaderVariant1(header, isMainPage, rootPath);
    } else if (headerVariant === '2') {
        applyHeaderVariant2(header, isMainPage, rootPath);
    } else if (headerVariant === '3') {
        applyHeaderVariant3(header, isMainPage, rootPath);
    }
    
    // Инициализация обработчиков для мобильного меню
    initMobileMenuHandlers();
    
    // Обработка прокрутки для фиксированной шапки
    handleScrolledHeader();
}

// Обработка прокрутки страницы
function handleScrolledHeader() {
    const header = document.querySelector('header');
    
    if (header) {
        // Первоначальная проверка позиции прокрутки
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Обработка события прокрутки
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// Функция для применения варианта 1 хедера
function applyHeaderVariant1(header, isMainPage, rootPath) {
    header.innerHTML = `
        <div class="header-container">
            <div class="logo">
                <a href="${isMainPage ? 'index.html' : '../index.html'}">
                    <img src="${rootPath}assets/images/logo.png" alt="Лесной дворик" width="150" height="50">
                </a>
            </div>
            <nav class="main-menu">
                <ul>
                    <li><a href="${isMainPage ? '#about' : '../index.html#about'}">О нас</a></li>
                    <li class="dropdown">
                        <a href="${isMainPage ? 'pages/hotel.html' : 'hotel.html'}">Номера</a>
                        <div class="dropdown-content">
                            <a href="${isMainPage ? 'pages/hotel.html#econom' : 'hotel.html#econom'}">Эконом</a>
                            <a href="${isMainPage ? 'pages/hotel.html#standard' : 'hotel.html#standard'}">Стандарт</a>
                            <a href="${isMainPage ? 'pages/hotel.html#comfort' : 'hotel.html#comfort'}">Комфорт</a>
                            <a href="${isMainPage ? 'pages/hotel.html#lux' : 'hotel.html#lux'}">Люкс</a>
                        </div>
                    </li>
                    <li><a href="${isMainPage ? 'pages/sauna.html' : 'sauna.html'}">Сауна</a></li>
                    <li><a href="${isMainPage ? 'pages/banquet.html' : 'banquet.html'}">Банкетный зал</a></li>
                    <li><a href="${isMainPage ? 'pages/gallery.html' : 'gallery.html'}">Галерея</a></li>
                    <li><a href="${isMainPage ? 'pages/virtual-tour.html' : 'virtual-tour.html'}"><i class="fas fa-vr-cardboard"></i> 3D-тур</a></li>
                    <li><a href="${isMainPage ? 'pages/contacts.html' : 'contacts.html'}">Контакты</a></li>
                </ul>
            </nav>
            <div class="booking-button">
                <a href="${isMainPage ? 'pages/booking.html' : 'booking.html'}" class="btn btn-primary">Забронировать <i class="fas fa-arrow-right"></i></a>
            </div>
            <button class="mobile-menu-toggle" aria-label="Открыть меню">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    `;
}

// Функция для применения варианта 2 хедера
function applyHeaderVariant2(header, isMainPage, rootPath) {
    header.innerHTML = `
        <div class="header-top">
            <div class="header-top-container">
                <div class="contact-info">
                    <a href="tel:+79151201744"><i class="fas fa-phone"></i> +7 (915) 120-17-44</a>
                    <a href="mailto:info@lesnoy-dvorik.ru"><i class="fas fa-envelope"></i> info@lesnoy-dvorik.ru</a>
                </div>
                <div class="social-links">
                    <a href="https://vk.com/lesoydvorik" target="_blank" aria-label="Вконтакте"><i class="fab fa-vk"></i></a>
                    <a href="https://t.me/lesoydvorik" target="_blank" aria-label="Telegram"><i class="fab fa-telegram"></i></a>
                    <a href="https://wa.me/79151201744" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
        </div>
        <div class="header-main">
            <div class="header-main-container">
                <div class="logo">
                    <a href="${isMainPage ? 'index.html' : '../index.html'}">
                        <img src="${rootPath}assets/images/logo.png" alt="Лесной дворик" width="150" height="50">
                    </a>
                </div>
                <nav class="main-menu">
                    <ul>
                        <li><a href="${isMainPage ? '#about' : '../index.html#about'}">О нас</a></li>
                        <li class="dropdown">
                            <a href="${isMainPage ? 'pages/hotel.html' : 'hotel.html'}">Номера</a>
                            <div class="dropdown-content">
                                <a href="${isMainPage ? 'pages/hotel.html#econom' : 'hotel.html#econom'}">Эконом</a>
                                <a href="${isMainPage ? 'pages/hotel.html#standard' : 'hotel.html#standard'}">Стандарт</a>
                                <a href="${isMainPage ? 'pages/hotel.html#comfort' : 'hotel.html#comfort'}">Комфорт</a>
                                <a href="${isMainPage ? 'pages/hotel.html#lux' : 'hotel.html#lux'}">Люкс</a>
                            </div>
                        </li>
                        <li><a href="${isMainPage ? 'pages/sauna.html' : 'sauna.html'}">Сауна</a></li>
                        <li><a href="${isMainPage ? 'pages/banquet.html' : 'banquet.html'}">Банкетный зал</a></li>
                        <li><a href="${isMainPage ? 'pages/gallery.html' : 'gallery.html'}">Галерея</a></li>
                        <li><a href="${isMainPage ? 'pages/virtual-tour.html' : 'virtual-tour.html'}"><i class="fas fa-vr-cardboard"></i> 3D-тур</a></li>
                        <li><a href="${isMainPage ? 'pages/contacts.html' : 'contacts.html'}">Контакты</a></li>
                    </ul>
                </nav>
                <div class="booking-button">
                    <a href="${isMainPage ? 'pages/booking.html' : 'booking.html'}" class="btn btn-primary">Забронировать</a>
                </div>
                <button class="mobile-menu-toggle" aria-label="Открыть меню">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    `;
}

// Функция для применения варианта 3 хедера
function applyHeaderVariant3(header, isMainPage, rootPath) {
    header.innerHTML = `
        <div class="header-container">
            <div class="logo">
                <a href="${isMainPage ? 'index.html' : '../index.html'}">
                    <img src="${rootPath}assets/images/logo.png" alt="Лесной дворик" width="150" height="50">
                </a>
            </div>
            <div class="main-menu">
                <ul>
                    <li><a href="${isMainPage ? '#about' : '../index.html#about'}">О нас</a></li>
                    <li class="dropdown">
                        <a href="${isMainPage ? 'pages/hotel.html' : 'hotel.html'}">Номера</a>
                        <div class="dropdown-content">
                            <a href="${isMainPage ? 'pages/hotel.html#econom' : 'hotel.html#econom'}">Эконом</a>
                            <a href="${isMainPage ? 'pages/hotel.html#standard' : 'hotel.html#standard'}">Стандарт</a>
                            <a href="${isMainPage ? 'pages/hotel.html#comfort' : 'hotel.html#comfort'}">Комфорт</a>
                            <a href="${isMainPage ? 'pages/hotel.html#lux' : 'hotel.html#lux'}">Люкс</a>
                        </div>
                    </li>
                    <li><a href="${isMainPage ? 'pages/sauna.html' : 'sauna.html'}">Сауна</a></li>
                    <li><a href="${isMainPage ? 'pages/banquet.html' : 'banquet.html'}">Банкетный зал</a></li>
                    <li><a href="${isMainPage ? 'pages/gallery.html' : 'gallery.html'}">Галерея</a></li>
                    <li><a href="${isMainPage ? 'pages/virtual-tour.html' : 'virtual-tour.html'}"><i class="fas fa-vr-cardboard"></i> 3D-тур</a></li>
                    <li><a href="${isMainPage ? 'pages/contacts.html' : 'contacts.html'}">Контакты</a></li>
                </ul>
            </div>
            <div class="booking-button">
                <a href="${isMainPage ? 'pages/booking.html' : 'booking.html'}" class="btn btn-primary">Забронировать</a>
            </div>
            <button class="mobile-menu-toggle" aria-label="Открыть меню">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    `;
}

// Функция для инициализации обработчиков мобильного меню
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

// Функция для показа уведомления
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

// Применяем вариант хедера при загрузке страницы
document.addEventListener('DOMContentLoaded', applyHeaderVariant); 