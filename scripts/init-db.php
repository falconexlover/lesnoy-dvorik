<?php
/**
 * Скрипт инициализации базы данных для гостиницы "Лесной дворик"
 * Создает необходимые таблицы и заполняет их начальными данными
 */

// Загрузка конфигурации базы данных
require_once __DIR__ . '/../src/includes/db_config.php';

// Функция для создания таблиц
function createTables($pdo) {
    try {
        // Таблица номеров
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS rooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                capacity_adults INT NOT NULL DEFAULT 2,
                capacity_children INT NOT NULL DEFAULT 0,
                amenities TEXT,
                images TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Таблица бронирований
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                guest_name VARCHAR(100) NOT NULL,
                guest_email VARCHAR(100) NOT NULL,
                guest_phone VARCHAR(20) NOT NULL,
                check_in_date DATE NOT NULL,
                check_out_date DATE NOT NULL,
                adults INT NOT NULL DEFAULT 1,
                children INT NOT NULL DEFAULT 0,
                special_requests TEXT,
                total_price DECIMAL(10,2) NOT NULL,
                status ENUM('new', 'confirmed', 'cancelled', 'completed') DEFAULT 'new',
                payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (room_id) REFERENCES rooms(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Таблица отзывов
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                guest_name VARCHAR(100) NOT NULL,
                rating INT NOT NULL,
                comment TEXT NOT NULL,
                stay_date DATE,
                is_approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Таблица контента сайта
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS content (
                id INT AUTO_INCREMENT PRIMARY KEY,
                page VARCHAR(50) NOT NULL,
                section VARCHAR(50) NOT NULL,
                title VARCHAR(255),
                content TEXT,
                image VARCHAR(255),
                order_num INT DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY page_section (page, section)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Таблица настроек
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(50) NOT NULL UNIQUE,
                setting_value TEXT,
                description VARCHAR(255),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Таблица пользователей (для админ-панели)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                role ENUM('admin', 'manager', 'editor') DEFAULT 'editor',
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        echo "Таблицы успешно созданы.\n";
        return true;
    } catch (PDOException $e) {
        echo "Ошибка при создании таблиц: " . $e->getMessage() . "\n";
        return false;
    }
}

// Функция для заполнения таблиц начальными данными
function seedDatabase($pdo) {
    try {
        // Добавление номеров
        $rooms = [
            ['type' => 'econom', 'name' => 'Эконом', 'description' => 'Уютный номер с основными удобствами', 'price' => 2500, 'capacity_adults' => 2, 'capacity_children' => 0],
            ['type' => 'standard', 'name' => 'Стандарт', 'description' => 'Комфортабельный номер со всеми удобствами', 'price' => 3500, 'capacity_adults' => 2, 'capacity_children' => 1],
            ['type' => 'family', 'name' => 'Семейный', 'description' => 'Просторный номер для семейного отдыха', 'price' => 5000, 'capacity_adults' => 2, 'capacity_children' => 2],
            ['type' => 'comfort', 'name' => 'Комфорт', 'description' => 'Улучшенный номер с дополнительными удобствами', 'price' => 4500, 'capacity_adults' => 2, 'capacity_children' => 1],
            ['type' => 'lux', 'name' => 'Люкс', 'description' => 'Роскошный номер с панорамным видом', 'price' => 7000, 'capacity_adults' => 2, 'capacity_children' => 2]
        ];

        $stmt = $pdo->prepare("
            INSERT INTO rooms (type, name, description, price, capacity_adults, capacity_children)
            VALUES (:type, :name, :description, :price, :capacity_adults, :capacity_children)
        ");

        foreach ($rooms as $room) {
            $stmt->execute($room);
        }

        // Добавление администратора
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        $pdo->exec("
            INSERT INTO users (username, password, email, role)
            VALUES ('admin', '{$admin_password}', 'admin@lesnoy-dvorik.ru', 'admin')
        ");

        // Добавление базовых настроек
        $settings = [
            ['setting_key' => 'site_name', 'setting_value' => 'Гостиница "Лесной дворик"', 'description' => 'Название сайта'],
            ['setting_key' => 'contact_email', 'setting_value' => 'info@lesnoy-dvorik.ru', 'description' => 'Контактный email'],
            ['setting_key' => 'contact_phone', 'setting_value' => '+7 (915) 120-17-44', 'description' => 'Контактный телефон'],
            ['setting_key' => 'address', 'setting_value' => 'г. Москва, ул. Лесная, д. 10', 'description' => 'Адрес гостиницы'],
            ['setting_key' => 'working_hours', 'setting_value' => 'Круглосуточно', 'description' => 'Часы работы']
        ];

        $stmt = $pdo->prepare("
            INSERT INTO settings (setting_key, setting_value, description)
            VALUES (:setting_key, :setting_value, :description)
        ");

        foreach ($settings as $setting) {
            $stmt->execute($setting);
        }

        echo "Начальные данные успешно добавлены.\n";
        return true;
    } catch (PDOException $e) {
        echo "Ошибка при добавлении начальных данных: " . $e->getMessage() . "\n";
        return false;
    }
}

// Основная функция инициализации
function initDatabase() {
    try {
        echo "Начинаем инициализацию базы данных...\n";
        
        // Получаем соединение с базой данных
        $pdo = getDBConnection();
        
        // Создаем таблицы
        if (!createTables($pdo)) {
            return false;
        }
        
        // Заполняем таблицы начальными данными
        if (!seedDatabase($pdo)) {
            return false;
        }
        
        echo "Инициализация базы данных успешно завершена!\n";
        return true;
    } catch (Exception $e) {
        echo "Произошла ошибка: " . $e->getMessage() . "\n";
        return false;
    }
}

// Запуск инициализации
initDatabase(); 