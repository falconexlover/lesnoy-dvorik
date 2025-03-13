/**
 * Улучшения навигации для сайта гостиницы "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Navigation fix script loaded');
    
    // Функция для определения активного пункта меню
    function setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const menuItems = document.querySelectorAll('.main-menu li');
        
        menuItems.forEach(item => {
            const link = item.querySelector('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            
            // Удаляем класс active со всех пунктов меню
            item.classList.remove('active');
            
            // Проверяем, соответствует ли ссылка текущему пути
            if (currentPath.endsWith(href) || 
                (href.includes('#') && currentPath.endsWith('index.html') && href.startsWith('#')) ||
                (currentPath.endsWith('/') && href === 'index.html')) {
                item.classList.add('active');
            }
        });
    }
    
    // Функция для улучшения работы мобильного меню
    function enhanceMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mainMenu = document.querySelector('.main-menu');
        const menuOverlay = document.querySelector('.menu-overlay');
        
        if (!mobileMenuToggle || !mainMenu) return;
        
        // Создаем оверлей для мобильного меню, если его нет
        if (!menuOverlay) {
            const overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);
            
            // Добавляем обработчик клика по оверлею
            overlay.addEventListener('click', function() {
                mainMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                this.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        }
    }
    
    // Функция для плавной прокрутки к якорям
    function enhanceSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                // Пропускаем, если это не якорь или якорь пустой
                if (targetId === '#' || targetId === '') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Закрываем мобильное меню, если оно открыто
                    const mainMenu = document.querySelector('.main-menu');
                    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                    const menuOverlay = document.querySelector('.menu-overlay');
                    
                    if (mainMenu && mainMenu.classList.contains('active')) {
                        mainMenu.classList.remove('active');
                        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
                        if (menuOverlay) menuOverlay.classList.remove('active');
                        document.body.classList.remove('menu-open');
                    }
                    
                    // Плавная прокрутка к элементу
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Учитываем высоту хедера
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Функция для улучшения работы выпадающего меню
    function enhanceDropdownMenu() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const content = dropdown.querySelector('.dropdown-content');
            
            if (!link || !content) return;
            
            // Добавляем иконку для выпадающего меню
            if (!link.querySelector('.dropdown-icon')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-chevron-down dropdown-icon';
                icon.style.marginLeft = '5px';
                icon.style.fontSize = '0.8em';
                link.appendChild(icon);
            }
            
            // Для мобильных устройств
            if (window.innerWidth <= 992) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                    
                    // Изменяем иконку
                    const icon = this.querySelector('.dropdown-icon');
                    if (icon) {
                        icon.classList.toggle('fa-chevron-down');
                        icon.classList.toggle('fa-chevron-up');
                    }
                });
            }
        });
    }
    
    // Вызываем функции улучшения навигации
    setActiveMenuItem();
    enhanceMobileMenu();
    enhanceSmoothScroll();
    enhanceDropdownMenu();
    
    // Обновляем активный пункт меню при изменении хеша
    window.addEventListener('hashchange', setActiveMenuItem);
}); 