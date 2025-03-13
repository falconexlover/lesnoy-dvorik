/**
 * Скрипт для отладки проблем с хедером
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Header debug script loaded');
    
    // Проверяем, загружен ли header-autoload.js
    console.log('header-autoload.js loaded:', typeof addStylesheet !== 'undefined');
    
    // Проверяем, загружен ли apply-header.js
    console.log('apply-header.js loaded:', typeof applyHeaderVariant !== 'undefined');
    
    // Проверяем, есть ли элемент header
    console.log('Header element exists:', document.querySelector('header') !== null);
    
    // Если header существует, проверяем его содержимое
    if (document.querySelector('header')) {
        console.log('Header content:', document.querySelector('header').innerHTML);
    }
    
    // Если apply-header.js загружен, но хедер не применен, пробуем применить его вручную
    setTimeout(function() {
        if (typeof applyHeaderVariant !== 'undefined' && document.querySelector('header') && 
            document.querySelector('header').innerHTML.trim() === '<!-- Хедер будет заменен скриптом -->') {
            console.log('Trying to apply header manually');
            applyHeaderVariant();
        }
    }, 1000);
    
    // Проверяем, загружены ли все необходимые стили
    const requiredStyles = [
        'css/style.css',
        'css/components.css',
        'css/header-fix.css'
    ];
    
    requiredStyles.forEach(style => {
        const isLoaded = document.querySelector(`link[href*="${style}"]`) !== null;
        console.log(`Style ${style} loaded:`, isLoaded);
    });
}); 