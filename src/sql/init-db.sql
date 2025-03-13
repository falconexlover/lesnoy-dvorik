-- Инициализация базы данных для гостиницы "Лесной дворик"

-- Создание таблицы номеров
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    capacity_adults INT NOT NULL DEFAULT 2,
    capacity_children INT NOT NULL DEFAULT 0,
    amenities TEXT,
    image VARCHAR(255),
    status ENUM('available', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы бронирований
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    room_id INT NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    special_requests TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_status ENUM('not_paid', 'pending', 'paid', 'refunded') NOT NULL DEFAULT 'not_paid',
    access_token VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Создание таблицы платежей
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    payment_id VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    provider VARCHAR(50) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы отзывов
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Вставка тестовых данных для номеров
INSERT INTO rooms (type, name, description, price, capacity_adults, capacity_children, amenities, image, status)
VALUES
    ('standard', 'Стандартный номер', 'Уютный номер с одной двуспальной кроватью, идеально подходит для пар.', 3500.00, 2, 0, 'Wi-Fi, Телевизор, Кондиционер, Холодильник, Душ', 'standard.jpg', 'available'),
    ('comfort', 'Комфорт', 'Просторный номер с двуспальной кроватью и дополнительными удобствами.', 4500.00, 2, 1, 'Wi-Fi, Телевизор, Кондиционер, Холодильник, Ванна, Фен, Мини-бар', 'comfort.jpg', 'available'),
    ('luxury', 'Люкс', 'Роскошный номер с гостиной зоной и спальней, идеально подходит для длительного проживания.', 6500.00, 2, 2, 'Wi-Fi, Телевизор, Кондиционер, Холодильник, Ванна, Фен, Мини-бар, Сейф, Халаты, Тапочки', 'luxury.jpg', 'available'),
    ('family', 'Семейный номер', 'Просторный номер с двумя спальнями, идеально подходит для семей с детьми.', 7500.00, 4, 2, 'Wi-Fi, Телевизор, Кондиционер, Холодильник, Ванна, Фен, Мини-бар, Сейф, Детская кроватка', 'family.jpg', 'available');

-- Вставка тестовых данных для администратора
INSERT INTO users (name, email, password, phone, role, status)
VALUES
    ('Администратор', 'admin@lesnoy-dvorik.ru', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+79001234567', 'admin', 'active'); 