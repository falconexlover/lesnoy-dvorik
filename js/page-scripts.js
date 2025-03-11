document.addEventListener('DOMContentLoaded', function() {
    console.log("Загрузка скриптов страниц...");
    
    // Мобильное меню - общее для всех страниц
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    const body = document.body;
    const dropdowns = document.querySelectorAll('.dropdown');
    const header = document.querySelector('header');
    
    // Добавляем атрибуты доступности (ARIA) к элементам
    if (mobileMenuToggle) {
        mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-controls', 'main-menu');
        
        if (mainMenu) {
            mainMenu.id = 'main-menu';
            mainMenu.setAttribute('aria-labelledby', 'mobile-menu-toggle');
        }
    }
    
    // Обработка фиксированного заголовка при прокрутке
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
            this.classList.toggle('active');
            mainMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Изменяем текст для скринридеров
            this.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(event) {
            if (mainMenu.classList.contains('active') && 
                !mainMenu.contains(event.target) && 
                !mobileMenuToggle.contains(event.target)) {
                mainMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
            }
        });

        // Обработка выпадающих меню на мобильных устройствах
        if (window.innerWidth <= 768) {
            dropdowns.forEach(function(dropdown, index) {
                const link = dropdown.querySelector('a');
                const dropdownContent = dropdown.querySelector('.dropdown-content');
                
                if (dropdownContent) {
                    // Добавляем идентификаторы и атрибуты для доступности
                    const dropdownId = `dropdown-${index}`;
                    const contentId = `dropdown-content-${index}`;
                    dropdownContent.id = contentId;
                    
                    if (link) {
                        link.setAttribute('aria-expanded', 'false');
                        link.setAttribute('aria-controls', contentId);
                        link.setAttribute('aria-haspopup', 'true');
                        
                        link.addEventListener('click', function(e) {
                            if (window.innerWidth <= 768) {
                                e.preventDefault();
                                // Закрываем другие открытые выпадающие меню
                                dropdowns.forEach(function(otherDropdown) {
                                    if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                                        const otherLink = otherDropdown.querySelector('a');
                                        if (otherLink) {
                                            otherLink.setAttribute('aria-expanded', 'false');
                                        }
                                        otherDropdown.classList.remove('active');
                                    }
                                });
                                
                                const expanded = this.getAttribute('aria-expanded') === 'true' || false;
                                this.setAttribute('aria-expanded', !expanded);
                                dropdown.classList.toggle('active');
                            }
                        });
                    }
                }
            });
        }
        
        // Закрытие мобильного меню при клике на ссылки, которые не являются выпадающими
        const regularLinks = mainMenu.querySelectorAll('li:not(.dropdown) > a');
        regularLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    mainMenu.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    body.classList.remove('menu-open');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
                }
            });
        });

        // Обновление поведения при изменении размера окна
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mainMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
                
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
                
                dropdowns.forEach(function(dropdown) {
                    dropdown.classList.remove('active');
                    const link = dropdown.querySelector('a');
                    if (link) {
                        link.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });
    }
    
    // Функционал для меню в банкетном зале
    const menuTabs = document.querySelectorAll('.menu-tab');
    if (menuTabs.length > 0) {
        menuTabs.forEach(function(tab, index) {
            // Добавляем атрибуты доступности
            const menuId = tab.getAttribute('data-menu');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
            tab.setAttribute('aria-controls', menuId);
            tab.id = `tab-${menuId}`;
            
            const tabPanel = document.getElementById(menuId);
            if (tabPanel) {
                tabPanel.setAttribute('role', 'tabpanel');
                tabPanel.setAttribute('aria-labelledby', `tab-${menuId}`);
                tabPanel.setAttribute('tabindex', '0');
            }
            
            tab.addEventListener('click', function() {
                // Удаляем активный класс со всех вкладок
                menuTabs.forEach(function(t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                
                // Добавляем активный класс текущей вкладке
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Получаем ID меню для отображения
                const menuId = this.getAttribute('data-menu');
                
                // Скрываем все меню
                const menuLists = document.querySelectorAll('.menu-list');
                menuLists.forEach(function(menu) {
                    menu.classList.remove('active');
                });
                
                // Показываем выбранное меню
                document.getElementById(menuId).classList.add('active');
            });
            
            // Обеспечиваем навигацию с клавиатуры
            tab.addEventListener('keydown', function(e) {
                switch (e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextTab = menuTabs[index + 1] || menuTabs[0];
                        nextTab.focus();
                        nextTab.click();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevTab = menuTabs[index - 1] || menuTabs[menuTabs.length - 1];
                        prevTab.focus();
                        prevTab.click();
                        break;
                }
            });
        });
    }
    
    // Галерея с лайтбоксом
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        galleryItems.forEach(function(item, index) {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', 'Открыть изображение в полном размере');
            
            // Обработчик для мыши
            item.addEventListener('click', function() {
                openLightbox(this);
            });
            
            // Обработчик для клавиатуры
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(this);
                }
            });
        });
        
        function openLightbox(item) {
            const imgSrc = item.querySelector('img').getAttribute('src');
            const imgAlt = item.querySelector('img').getAttribute('alt') || 'Изображение галереи';
            
            const lightbox = document.createElement('div');
            lightbox.classList.add('lightbox');
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-label', 'Просмотр изображения');
            
            const lightboxContent = document.createElement('div');
            lightboxContent.classList.add('lightbox-content');
            
            const closeBtn = document.createElement('span');
            closeBtn.classList.add('lightbox-close');
            closeBtn.innerHTML = '&times;';
            closeBtn.setAttribute('role', 'button');
            closeBtn.setAttribute('tabindex', '0');
            closeBtn.setAttribute('aria-label', 'Закрыть');
            
            const img = document.createElement('img');
            img.setAttribute('src', imgSrc);
            img.setAttribute('alt', imgAlt);
            
            lightboxContent.appendChild(closeBtn);
            lightboxContent.appendChild(img);
            lightbox.appendChild(lightboxContent);
            document.body.appendChild(lightbox);
            
            // Предотвращаем прокрутку body
            body.classList.add('menu-open');
            
            // Делаем кнопку закрытия активной
            closeBtn.focus();
            
            // Закрытие лайтбокса по клику
            closeBtn.addEventListener('click', function() {
                closeLightbox(lightbox);
            });
            
            // Закрытие по клавише
            closeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeLightbox(lightbox);
                }
            });
            
            // Закрытие по клику вне изображения
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeLightbox(lightbox);
                }
            });
            
            // Закрытие по Escape
            document.addEventListener('keydown', function escapeListener(e) {
                if (e.key === 'Escape') {
                    closeLightbox(lightbox);
                    document.removeEventListener('keydown', escapeListener);
                }
            });
        }
        
        function closeLightbox(lightbox) {
            document.body.removeChild(lightbox);
            body.classList.remove('menu-open');
        }
    }
    
    // Плавная прокрутка к якорям
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]:not(.dropdown > a)');
    smoothScrollLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Установка фокуса для доступности
                    setTimeout(function() {
                        targetElement.setAttribute('tabindex', '-1');
                        targetElement.focus();
                    }, 1000);
                }
            }
        });
    });
    
    // Анимация появления элементов при прокрутке
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkIfInView() {
        const windowHeight = window.innerHeight;
        const windowTopPosition = window.scrollY;
        const windowBottomPosition = windowTopPosition + windowHeight;
        
        animatedElements.forEach(function(element) {
            const elementHeight = element.offsetHeight;
            const elementTopPosition = element.offsetTop;
            const elementBottomPosition = elementTopPosition + elementHeight;
            
            // Проверка, видно ли элемент
            if (
                (elementBottomPosition >= windowTopPosition) &&
                (elementTopPosition <= windowBottomPosition)
            ) {
                element.classList.add('animated');
            }
        });
    }
    
    // Запускаем проверку при загрузке страницы
    checkIfInView();
    
    // Запускаем проверку при прокрутке
    window.addEventListener('scroll', checkIfInView);

    // Функционал улучшения адаптивности и оптимизации изображений для мобильных устройств
    // Проверка типа устройства
    const isMobile = window.innerWidth <= 768;
    
    // Ленивая загрузка изображений для ускорения загрузки страницы на мобильных устройствах
    if ('loading' in HTMLImageElement.prototype) {
        // Встроенная нативная ленивая загрузка для браузеров, которые поддерживают ее
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });
    } else {
        // Полифилл для ленивой загрузки в старых браузерах
        const lazyImages = document.querySelectorAll('.lazy-image');
        
        if ("IntersectionObserver" in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        if (lazyImage.dataset.srcset) {
                            lazyImage.srcset = lazyImage.dataset.srcset;
                        }
                        lazyImage.classList.remove("lazy-image");
                        imageObserver.unobserve(lazyImage);
                    }
                });
            });
            
            lazyImages.forEach(function(lazyImage) {
                imageObserver.observe(lazyImage);
            });
        } else {
            // Для браузеров без поддержки IntersectionObserver - загружаем все изображения сразу
            lazyImages.forEach(function(lazyImage) {
                lazyImage.src = lazyImage.dataset.src;
                if (lazyImage.dataset.srcset) {
                    lazyImage.srcset = lazyImage.dataset.srcset;
                }
                lazyImage.classList.remove("lazy-image");
            });
        }
    }
    
    // Оптимизация изображений в галерее для мобильных устройств
    if (isMobile) {
        const galleryImages = document.querySelectorAll('.gallery-item img');
        galleryImages.forEach(img => {
            // Если есть мобильная версия изображения, используем её
            if (img.dataset.mobileSrc) {
                img.src = img.dataset.mobileSrc;
            }
        });
    }
    
    // Добавление мобильной навигации по типам номеров (для страницы hotel.html)
    if (document.querySelector('.room-navigation') && isMobile) {
        const roomNavigation = document.querySelector('.room-navigation');
        const mobileNavSelector = document.createElement('div');
        mobileNavSelector.className = 'mobile-room-navigation';
        
        const roomSelect = document.createElement('select');
        roomSelect.setAttribute('aria-label', 'Выберите тип номера');
        
        const roomLinks = roomNavigation.querySelectorAll('a');
        roomLinks.forEach(link => {
            const option = document.createElement('option');
            option.value = link.getAttribute('href');
            option.textContent = link.textContent;
            roomSelect.appendChild(option);
        });
        
        roomSelect.addEventListener('change', function() {
            window.location.href = this.value;
        });
        
        mobileNavSelector.appendChild(roomSelect);
        roomNavigation.parentNode.insertBefore(mobileNavSelector, roomNavigation);
    }
    
    // Добавление мобильного переключателя для вкладок спецпредложений (для страницы special.html)
    if (document.querySelector('.tab-buttons') && isMobile) {
        const tabButtons = document.querySelector('.tab-buttons');
        const mobileTabSelector = document.createElement('div');
        mobileTabSelector.className = 'mobile-tab-selector';
        
        const tabSelect = document.createElement('select');
        tabSelect.setAttribute('aria-label', 'Выберите категорию предложений');
        
        const tabs = tabButtons.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            const option = document.createElement('option');
            option.value = tab.dataset.tab;
            option.textContent = tab.textContent;
            if (tab.classList.contains('active')) {
                option.selected = true;
            }
            tabSelect.appendChild(option);
        });
        
        tabSelect.addEventListener('change', function() {
            // Эмулируем клик по соответствующей вкладке
            const tabToClick = document.querySelector(`.tab-button[data-tab="${this.value}"]`);
            if (tabToClick) {
                tabToClick.click();
            }
        });
        
        mobileTabSelector.appendChild(tabSelect);
        tabButtons.parentNode.insertBefore(mobileTabSelector, tabButtons);
    }

    // Добавление таблицам класса для горизонтальной прокрутки на мобильных устройствах
    if (isMobile) {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Если таблица не находится в контейнере с прокруткой, добавляем его
            if (!table.parentElement.classList.contains('table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }
    
    // Оптимизация загрузки шрифтовых иконок (Font Awesome) на мобильных устройствах
    if (isMobile) {
        const fontAwesomeLink = document.querySelector('link[href*="font-awesome"]');
        if (fontAwesomeLink) {
            fontAwesomeLink.setAttribute('media', 'all');
            fontAwesomeLink.setAttribute('onload', "this.media='all'");
        }
    }
}); 