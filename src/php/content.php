<?php
/**
 * Обработчик запросов контента для гостиницы "Лесной дворик"
 */

// Подключение конфигурации базы данных
require_once '../includes/db_config.php';

// Определение действия
$action = isset($_GET['action']) ? $_GET['action'] : 'get';
$section = isset($_GET['section']) ? $_GET['section'] : null;

// Получение контента для определенной секции
if ($action === 'get' && $section) {
    try {
        // Получение контента из базы данных
        $content = fetchOne(
            "SELECT id, section, title, content, meta_title, meta_description, last_updated 
             FROM content 
             WHERE section = ?",
            [$section]
        );
        
        if (!$content) {
            // Если контент не найден
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Контент не найден'
            ]);
            exit;
        }
        
        // Возвращаем контент в формате JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $content
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при получении контента: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при загрузке контента. Пожалуйста, попробуйте позже.'
        ]);
    }
}
// Получение всех секций контента
elseif ($action === 'list') {
    try {
        // Получение списка всех секций контента
        $sections = fetchAll(
            "SELECT id, section, title, last_updated 
             FROM content 
             ORDER BY section ASC"
        );
        
        // Возвращаем список секций в формате JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $sections
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при получении списка секций контента: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при загрузке списка секций контента. Пожалуйста, попробуйте позже.'
        ]);
    }
}
// Получение настроек сайта
elseif ($action === 'settings') {
    try {
        // Получение всех настроек сайта
        $settings = fetchAll("SELECT setting_key, setting_value FROM settings");
        
        // Преобразование в ассоциативный массив
        $settingsArray = [];
        foreach ($settings as $setting) {
            $key = $setting['setting_key'];
            $value = $setting['setting_value'];
            
            // Попытка декодировать JSON, если это возможно
            $jsonValue = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settingsArray[$key] = $jsonValue;
            } else {
                $settingsArray[$key] = $value;
            }
        }
        
        // Возвращаем настройки в формате JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $settingsArray
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при получении настроек сайта: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при загрузке настроек сайта. Пожалуйста, попробуйте позже.'
        ]);
    }
}
// Получение данных для главной страницы
elseif ($action === 'homepage') {
    try {
        // Получение контента для главной страницы
        $homepage = fetchOne(
            "SELECT id, section, title, content, meta_title, meta_description 
             FROM content 
             WHERE section = 'homepage'"
        );
        
        // Получение избранных номеров
        $featuredRooms = fetchAll(
            "SELECT id, name, description, price, capacity, images 
             FROM rooms 
             WHERE is_active = 1 AND is_featured = 1 
             ORDER BY price ASC 
             LIMIT 3"
        );
        
        // Преобразование строковых данных в массивы для номеров
        foreach ($featuredRooms as &$room) {
            if (isset($room['images'])) {
                $room['images'] = json_decode($room['images'], true);
            } else {
                $room['images'] = [];
            }
            
            // Форматирование цены
            $room['price_formatted'] = number_format($room['price'], 0, ',', ' ') . ' ₽';
        }
        
        // Получение последних отзывов
        $reviews = fetchAll(
            "SELECT id, name, rating, comment, date_posted 
             FROM reviews 
             WHERE status = 'approved' 
             ORDER BY date_posted DESC 
             LIMIT 3"
        );
        
        // Форматирование даты для отзывов
        foreach ($reviews as &$review) {
            $review['date_posted'] = date('d.m.Y', strtotime($review['date_posted']));
        }
        
        // Получение настроек сайта
        $settings = fetchAll("SELECT setting_key, setting_value FROM settings");
        $settingsArray = [];
        foreach ($settings as $setting) {
            $key = $setting['setting_key'];
            $value = $setting['setting_value'];
            
            // Попытка декодировать JSON, если это возможно
            $jsonValue = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settingsArray[$key] = $jsonValue;
            } else {
                $settingsArray[$key] = $value;
            }
        }
        
        // Формирование данных для главной страницы
        $data = [
            'homepage' => $homepage,
            'featured_rooms' => $featuredRooms,
            'reviews' => $reviews,
            'settings' => $settingsArray
        ];
        
        // Возвращаем данные в формате JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при получении данных для главной страницы: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при загрузке данных для главной страницы. Пожалуйста, попробуйте позже.'
        ]);
    }
}
// Неизвестное действие
else {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Неизвестное действие или отсутствуют необходимые параметры'
    ]);
}