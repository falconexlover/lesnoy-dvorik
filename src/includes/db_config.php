<?php
/**
 * Конфигурация базы данных для гостиницы "Лесной дворик"
 * Временная версия для демонстрации панели администратора
 */

// Загрузка переменных окружения из .env файла
if (file_exists(__DIR__ . '/../../.env')) {
    $env_lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos($line, '#') === 0) continue; // Пропускаем комментарии
        list($key, $value) = explode('=', $line, 2);
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

// Режим отладки (true для разработки, false для продакшн)
define('DEBUG', getenv('DEBUG') === 'true');

// Email администратора для уведомлений
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'admin@lesnoy-dvorik.ru');

// Создаем заглушку для PDO
class MockPDO {
    public function prepare($query) {
        return new MockPDOStatement();
    }
    
    public function beginTransaction() {
        return true;
    }
    
    public function commit() {
        return true;
    }
    
    public function rollBack() {
        return true;
    }
    
    public function query($query) {
        return new MockPDOStatement();
    }
}

class MockPDOStatement {
    public function bindParam($param, &$value, $type = null) {
        return true;
    }
    
    public function execute() {
        return true;
    }
    
    public function fetch($fetch_style = null) {
        return ['total' => 10, 'new' => 5, 'confirmed' => 3, 'total_revenue' => 50000, 'room_type' => 'Люкс'];
    }
    
    public function fetchAll($fetch_style = null) {
        return [
            ['id' => 1, 'name' => 'Иванов Иван', 'phone' => '+7 (999) 123-45-67', 'email' => 'ivanov@example.com', 'arrival_date' => '2025-03-15', 'departure_date' => '2025-03-20', 'guests' => 2, 'room_type' => 'Люкс', 'comments' => 'Нужен ранний заезд', 'payment_method' => 'Карта', 'promo_code' => '', 'price' => 25000, 'status' => 'Подтверждено', 'created_at' => '2025-03-10 12:00:00'],
            ['id' => 2, 'name' => 'Петров Петр', 'phone' => '+7 (999) 987-65-43', 'email' => 'petrov@example.com', 'arrival_date' => '2025-03-20', 'departure_date' => '2025-03-25', 'guests' => 3, 'room_type' => 'Стандарт', 'comments' => '', 'payment_method' => 'Наличные', 'promo_code' => 'SPRING2025', 'price' => 15000, 'status' => 'Новое', 'created_at' => '2025-03-11 14:30:00'],
            ['id' => 3, 'name' => 'Сидорова Анна', 'phone' => '+7 (999) 555-55-55', 'email' => 'sidorova@example.com', 'arrival_date' => '2025-04-01', 'departure_date' => '2025-04-05', 'guests' => 1, 'room_type' => 'Эконом', 'comments' => 'Нужен поздний выезд', 'payment_method' => 'Карта', 'promo_code' => '', 'price' => 10000, 'status' => 'Подтверждено', 'created_at' => '2025-03-12 09:15:00']
        ];
    }
}

// Создаем экземпляр заглушки PDO
$pdo = new MockPDO();

// Функция для защиты от SQL-инъекций
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Функция для проверки авторизации администратора
function isAdminLoggedIn() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

// Функция для добавления нового бронирования в БД
function addBooking($pdo, $bookingData) {
    return true;
}

// Функция для получения всех бронирований из БД
function getAllBookings($pdo) {
    return $pdo->query("")->fetchAll();
}

// Функция для получения бронирования по ID
function getBookingById($pdo, $id) {
    return $pdo->query("")->fetch();
}

// Функция для обновления статуса бронирования
function updateBookingStatus($pdo, $id, $status) {
    return true;
}

// Функция для удаления бронирования
function deleteBooking($pdo, $id) {
    return true;
}

// Функция для получения статистики бронирований
function getBookingStats($pdo, $period = 'month') {
    $stats = [
        'total' => 10,
        'new' => 5,
        'confirmed' => 3,
        'total_revenue' => 50000,
        'popular_room' => 'Люкс',
        'period_data' => [
            ['period' => '2025-03', 'bookings_count' => 5, 'total_revenue' => 25000, 'avg_nights' => 3.5],
            ['period' => '2025-02', 'bookings_count' => 3, 'total_revenue' => 15000, 'avg_nights' => 2.8],
            ['period' => '2025-01', 'bookings_count' => 2, 'total_revenue' => 10000, 'avg_nights' => 4.0]
        ]
    ];
    
    return $stats;
}

// Функция для экспорта бронирований в CSV
function exportBookingsToCSV($pdo) {
    return [
        'filename' => 'bookings_export_' . date('Y-m-d_H-i-s') . '.csv',
        'content' => 'ID,Имя,Телефон,Email,Дата заезда,Дата выезда,Гостей,Тип номера,Комментарии,Способ оплаты,Промокод,Цена,Статус,Создано'
    ];
}

// Функции для работы с контентом сайта

// Получение контента для конкретной страницы
function getPageContent($pdo, $page) {
    return [
        ['id' => 1, 'page' => $page, 'section' => 'hero', 'title' => 'Гостиница "Лесной дворик"', 'content' => 'Уютный отдых в окружении природы', 'image_path' => '/assets/images/hero.jpg', 'sort_order' => 1],
        ['id' => 2, 'page' => $page, 'section' => 'about', 'title' => 'О нас', 'content' => 'Гостиница "Лесной дворик" - идеальное место для отдыха от городской суеты.', 'image_path' => '/assets/images/about.jpg', 'sort_order' => 2],
        ['id' => 3, 'page' => $page, 'section' => 'services', 'title' => 'Наши услуги', 'content' => 'Мы предлагаем комфортное проживание, вкусное питание и множество развлечений.', 'image_path' => '/assets/images/services.jpg', 'sort_order' => 3]
    ];
}

// Получение контента для конкретной секции страницы
function getSectionContent($pdo, $page, $section) {
    $content = getPageContent($pdo, $page);
    foreach ($content as $item) {
        if ($item['section'] === $section) {
            return $item;
        }
    }
    return null;
}

// Обновление контента секции
function updateSectionContent($pdo, $id, $contentData) {
    return true;
}

// Добавление новой секции контента
function addSectionContent($pdo, $contentData) {
    return true;
}

// Удаление секции контента
function deleteSectionContent($pdo, $id) {
    return true;
}

// Функции для работы с настройками сайта

// Получение всех настроек
function getAllSettings($pdo) {
    return [
        'site_name' => 'Гостиница "Лесной дворик"',
        'site_description' => 'Уютный отдых в окружении природы',
        'contact_phone' => '+7 (495) 123-45-67',
        'contact_email' => 'info@lesnoy-dvorik.ru',
        'contact_address' => 'г. Москва, ул. Лесная, д. 10',
        'map_api_key' => 'your-api-key',
        'map_coordinates' => '55.7558, 37.6173'
    ];
}

// Получение значения конкретной настройки
function getSetting($pdo, $key, $default = '') {
    $settings = getAllSettings($pdo);
    return isset($settings[$key]) ? $settings[$key] : $default;
}

// Обновление настройки
function updateSetting($pdo, $key, $value) {
    return true;
}

// Функция для загрузки изображений
function uploadImage($file, $targetDir = '../assets/images/') {
    return '/assets/images/sample.jpg';
}

// Функция для генерации HTML-страниц из шаблонов и контента
function generateHtmlPage($pdo, $page, $template, $outputPath) {
    return true;
}

// Функции для работы с дополнительными услугами
function getServices($pdo) {
    return [
        ['id' => 1, 'name' => 'Завтрак', 'description' => 'Шведский стол с 7:00 до 10:00', 'price' => 500, 'image_path' => '/assets/images/breakfast.jpg', 'is_active' => 1, 'sort_order' => 1],
        ['id' => 2, 'name' => 'Сауна', 'description' => 'Финская сауна с бассейном', 'price' => 2000, 'image_path' => '/assets/images/sauna.jpg', 'is_active' => 1, 'sort_order' => 2],
        ['id' => 3, 'name' => 'Трансфер', 'description' => 'Встреча в аэропорту/вокзале', 'price' => 1500, 'image_path' => '/assets/images/transfer.jpg', 'is_active' => 1, 'sort_order' => 3]
    ];
}

function getService($pdo, $service_id) {
    $services = getServices($pdo);
    foreach ($services as $service) {
        if ($service['id'] == $service_id) {
            return $service;
        }
    }
    return null;
}

function updateService($pdo, $service_id, $data) {
    return true;
}

function addService($pdo, $data) {
    return true;
}

function deleteService($pdo, $service_id) {
    return true;
}

// Функции для работы с метапоисковиками
function getMetasearchSettings($pdo) {
    return [
        'google_hotel_id' => '123456789',
        'yandex_hotel_id' => '987654321',
        'trivago_hotel_id' => 'hotel-lesnoy-dvorik',
        'booking_hotel_id' => 'lesnoy-dvorik-123',
        'feed_update_frequency' => 'daily'
    ];
}

function updateMetasearchSettings($pdo, $settings) {
    return true;
}

function getRoomOccupancy($pdo, $start_date, $end_date) {
    return [
        ['room_name' => 'Люкс', 'bookings_count' => 10, 'booked_nights' => 35, 'occupancy_percent' => 70],
        ['room_name' => 'Стандарт', 'bookings_count' => 15, 'booked_nights' => 45, 'occupancy_percent' => 90],
        ['room_name' => 'Эконом', 'bookings_count' => 8, 'booked_nights' => 20, 'occupancy_percent' => 40]
    ];
}

/**
 * Получение соединения с базой данных
 * @return PDO Объект соединения с базой данных
 */
function getDBConnection() {
    // Если мы в режиме разработки и нужна заглушка
    if (defined('USE_MOCK_DB') && USE_MOCK_DB) {
        return new MockPDO();
    }
    
    // Настройки подключения к БД
    $db_host = getenv('DB_HOST') ?: 'localhost';
    $db_name = getenv('DB_NAME') ?: 'lesnoy_dvorik';
    $db_user = getenv('DB_USER') ?: 'root';
    $db_pass = getenv('DB_PASSWORD') ?: 'password';
    
    try {
        $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        return new PDO($dsn, $db_user, $db_pass, $options);
    } catch (PDOException $e) {
        if (DEBUG) {
            throw new PDOException($e->getMessage(), (int)$e->getCode());
        } else {
            error_log("Ошибка подключения к БД: " . $e->getMessage());
            throw new PDOException("Ошибка подключения к базе данных", 500);
        }
    }
} 