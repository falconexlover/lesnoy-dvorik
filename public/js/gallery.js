/**
 * Скрипты для работы с галереей изображений
 */

document.addEventListener('DOMContentLoaded', function() {
    initGallery();
    initLightbox();
    initFilters();
    initMasonry();
});

/**
 * Инициализация основной галереи
 */
function initGallery() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    // Добавление классов для анимации при загрузке
    const items = gallery.querySelectorAll('.gallery-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('animate-in');
    });
}

/**
 * Инициализация лайтбокса для просмотра изображений
 */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;

    // Создание контейнера для лайтбокса
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox__overlay"></div>
        <div class="lightbox__container">
            <div class="lightbox__content">
                <img src="" alt="" class="lightbox__image">
            </div>
            <button class="lightbox__close">&times;</button>
            <button class="lightbox__prev">&lsaquo;</button>
            <button class="lightbox__next">&rsaquo;</button>
            <div class="lightbox__caption"></div>
            <div class="lightbox__counter"></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Получение элементов лайтбокса
    const lightboxOverlay = lightbox.querySelector('.lightbox__overlay');
    const lightboxClose = lightbox.querySelector('.lightbox__close');
    const lightboxImage = lightbox.querySelector('.lightbox__image');
    const lightboxPrev = lightbox.querySelector('.lightbox__prev');
    const lightboxNext = lightbox.querySelector('.lightbox__next');
    const lightboxCaption = lightbox.querySelector('.lightbox__caption');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');

    // Текущий индекс изображения
    let currentIndex = 0;
    const images = [];

    // Сбор данных об изображениях
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const link = item.querySelector('a') || item;
        const src = link.getAttribute('href') || img.getAttribute('src');
        const caption = img.getAttribute('alt') || '';

        images.push({ src, caption });

        // Обработчик клика по изображению
        item.addEventListener('click', function(e) {
            e.preventDefault();
            openLightbox(index);
        });
    });

    // Функция открытия лайтбокса
    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Функция закрытия лайтбокса
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Функция обновления содержимого лайтбокса
    function updateLightbox() {
        const image = images[currentIndex];
        lightboxImage.src = image.src;
        lightboxCaption.textContent = image.caption;
        lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    }

    // Функция перехода к предыдущему изображению
    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightbox();
    }

    // Функция перехода к следующему изображению
    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightbox();
    }

    // Обработчики событий
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);

    // Обработка клавиш
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    });
}

/**
 * Инициализация фильтров галереи
 */
function initFilters() {
    const filterButtons = document.querySelectorAll('.gallery-filter__button');
    if (filterButtons.length === 0) return;

    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаление активного класса у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавление активного класса текущей кнопке
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Фильтрация элементов галереи
            galleryItems.forEach(item => {
                if (filter === 'all') {
                    item.style.display = '';
                } else {
                    const itemCategory = item.getAttribute('data-category');
                    if (itemCategory === filter) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
            
            // Обновление сетки Masonry, если она используется
            if (typeof Masonry !== 'undefined' && masonryInstance) {
                setTimeout(() => {
                    masonryInstance.layout();
                }, 100);
            }
        });
    });
}

/**
 * Инициализация Masonry для красивой сетки галереи
 */
let masonryInstance = null;

function initMasonry() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    // Проверка наличия библиотеки Masonry
    if (typeof Masonry !== 'undefined') {
        masonryInstance = new Masonry(gallery, {
            itemSelector: '.gallery-item',
            columnWidth: '.gallery-sizer',
            percentPosition: true,
            transitionDuration: '0.3s'
        });

        // Обновление сетки после загрузки всех изображений
        const images = gallery.querySelectorAll('img');
        let loadedImages = 0;

        images.forEach(img => {
            if (img.complete) {
                imageLoaded();
            } else {
                img.addEventListener('load', imageLoaded);
                img.addEventListener('error', imageLoaded);
            }
        });

        function imageLoaded() {
            loadedImages++;
            if (loadedImages === images.length) {
                masonryInstance.layout();
            }
        }
    } else {
        console.warn('Masonry library not found. Using CSS grid instead.');
        gallery.classList.add('gallery--grid');
    }
} 