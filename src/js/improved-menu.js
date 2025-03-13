/**
 * Улучшенная функциональность меню
 */
document.addEventListener('DOMContentLoaded', function() {
    // Добавление класса active для текущей страницы
    const currentPage = window.location.pathname.split('/').pop();
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === '#about')) {
            link.classList.add('active');
        }
    });
    
    // Мобильное меню
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const menuList = document.querySelector('.menu-list');
    const body = document.body;
    
    // Создаем оверлей для мобильного меню
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    body.appendChild(menuOverlay);
    
    // Обработчик для переключателя меню
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            menuList.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });
    }
    
    // Закрытие меню при клике на оверлей
    menuOverlay.addEventListener('click', function() {
        mobileMenuToggle.classList.remove('active');
        menuList.classList.remove('active');
        this.classList.remove('active');
        body.classList.remove('no-scroll');
    });
    
    // Обработка выпадающих меню на мобильных устройствах
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('.has-dropdown');
        
        dropdownLink.addEventListener('click', function(e) {
            // Проверяем, находимся ли мы в мобильной версии
            if (window.innerWidth <= 991) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // Закрытие мобильного меню при изменении размера окна
    window.addEventListener('resize', function() {
        if (window.innerWidth > 991) {
            mobileMenuToggle.classList.remove('active');
            menuList.classList.remove('active');
            menuOverlay.classList.remove('active');
            body.classList.remove('no-scroll');
            
            // Сбрасываем активные выпадающие меню
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}); 