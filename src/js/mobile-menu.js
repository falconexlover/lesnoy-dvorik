/**
 * Скрипт для мобильного меню
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    const body = document.body;
    const header = document.querySelector('header');
    
    if (!mobileMenuToggle || !mainMenu) return;
    
    // Настройка атрибутов доступности
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-controls', 'main-menu');
    mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
    
    // Обработка клика по кнопке мобильного меню
    mobileMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const newExpandedState = !isExpanded;
        
        // Обновляем атрибуты и классы
        this.setAttribute('aria-expanded', newExpandedState);
        this.setAttribute('aria-label', newExpandedState ? 'Закрыть меню' : 'Открыть меню');
        
        // Переключаем классы
        this.classList.toggle('active');
        mainMenu.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        // Анимация иконки гамбургера
        const spans = this.querySelectorAll('span');
        if (spans.length >= 3) {
            if (newExpandedState) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
    
    // Закрытие при клике вне меню
    document.addEventListener('click', function(e) {
        if (mainMenu.classList.contains('active') && 
            !mainMenu.contains(e.target) && 
            !mobileMenuToggle.contains(e.target)) {
            
            mainMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
            body.classList.remove('menu-open');
            
            // Возвращаем иконку гамбургера в исходное состояние
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (spans.length >= 3) {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
    
    // Настройка выпадающих подменю в мобильной версии
    const dropdowns = mainMenu.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        const submenu = dropdown.querySelector('.dropdown-content');
        
        if (dropdownLink && submenu) {
            // Создаем отдельную кнопку для раскрытия подменю (для лучшей доступности)
            const toggleButton = document.createElement('button');
            toggleButton.className = 'dropdown-toggle';
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i>';
            toggleButton.setAttribute('aria-label', 'Открыть подменю');
            
            dropdownLink.parentNode.insertBefore(toggleButton, dropdownLink.nextSibling);
            
            // Обработка клика по кнопке раскрытия подменю
            toggleButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                const newExpandedState = !isExpanded;
                
                // Закрываем другие открытые подменю
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                        otherDropdown.classList.remove('active');
                        const otherToggle = otherDropdown.querySelector('.dropdown-toggle');
                        if (otherToggle) {
                            otherToggle.setAttribute('aria-expanded', 'false');
                            otherToggle.setAttribute('aria-label', 'Открыть подменю');
                        }
                    }
                });
                
                // Обновляем текущее подменю
                this.setAttribute('aria-expanded', newExpandedState);
                this.setAttribute('aria-label', newExpandedState ? 'Закрыть подменю' : 'Открыть подменю');
                dropdown.classList.toggle('active');
            });
        }
    });
    
    // Обработка resize для изменения дополнительной логики в мобильном/десктопном виде
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        
        // При переходе с мобильной на десктопную версию сбрасываем состояния
        if (!isMobile && mainMenu.classList.contains('active')) {
            mainMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('menu-open');
            
            // Сбрасываем активные подменю
            dropdowns.forEach(dropdown => {
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                    const toggleButton = dropdown.querySelector('.dropdown-toggle');
                    if (toggleButton) {
                        toggleButton.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }
    });
}); 