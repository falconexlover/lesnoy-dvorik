/**
 * Скрипт для анимации хедера при скролле
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    
    // Функция для изменения стиля хедера при скролле
    function updateHeader() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Если хедер существует, добавляем слушатель события скролла
    if (header) {
        // Вызываем один раз при загрузке, чтобы применить стили,
        // если страница уже прокручена
        updateHeader();
        
        // Добавляем обработчик события скролла с оптимизацией производительности
        let scrollTimer;
        window.addEventListener('scroll', function() {
            if (!scrollTimer) {
                scrollTimer = setTimeout(function() {
                    updateHeader();
                    scrollTimer = null;
                }, 10);
            }
        });
        
        // Анимация для логотипа и навигации при загрузке страницы
        const logo = header.querySelector('.logo');
        const navItems = header.querySelectorAll('.main-menu li');
        
        if (logo) {
            logo.style.opacity = '0';
            logo.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                logo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                logo.style.opacity = '1';
                logo.style.transform = 'translateY(0)';
            }, 100);
        }
        
        if (navItems.length) {
            navItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 200 + (index * 100)); // Задержка для каждого пункта меню
            });
        }
    }
}); 