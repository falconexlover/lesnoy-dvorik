/**
 * Функция для переключения основного изображения в галерее номеров
 * @param {HTMLElement} thumbnail - Миниатюра, на которую кликнули
 * @param {string} roomType - Тип номера (id секции)
 */
function changeMainImage(thumbnail, roomType) {
    // Получаем контейнер галереи
    const galleryContainer = document.querySelector(`#${roomType} .room-gallery`);
    
    // Получаем основное изображение
    const mainImage = galleryContainer.querySelector('.main-image img');
    
    // Получаем все миниатюры
    const thumbnails = galleryContainer.querySelectorAll('.thumbnail');
    
    // Удаляем класс active у всех миниатюр
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    // Добавляем класс active к выбранной миниатюре
    thumbnail.classList.add('active');
    
    // Меняем src основного изображения
    mainImage.src = thumbnail.src;
    
    // Меняем alt основного изображения
    mainImage.alt = thumbnail.alt;
    
    // Добавляем анимацию
    mainImage.style.opacity = '0';
    setTimeout(() => {
        mainImage.style.opacity = '1';
    }, 50);
}

/**
 * Инициализация галерей для всех номеров
 */
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = `
        .room-gallery .main-image img {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Инициализируем галереи для всех типов номеров
    const roomTypes = ['econom', 'standard', 'family', 'comfort', 'lux'];
    
    roomTypes.forEach(roomType => {
        const galleryContainer = document.querySelector(`#${roomType} .room-gallery`);
        if (galleryContainer) {
            // Если галерея существует, добавляем обработчики событий
            const thumbnails = galleryContainer.querySelectorAll('.thumbnail');
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', function() {
                    changeMainImage(this, roomType);
                });
            });
        }
    });
}); 