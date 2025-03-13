<?php
/**
 * Класс для работы с пользователями
 * Гостиница "Лесной дворик"
 */

class User {
    // Константы для статусов пользователей
    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    
    // Константы для ролей пользователей
    const ROLE_ADMIN = 'admin';
    const ROLE_MANAGER = 'manager';
    const ROLE_USER = 'user';
    
    // Свойства пользователя
    private $id;
    private $name;
    private $email;
    private $phone;
    private $role;
    private $status;
    private $db;
    
    /**
     * Конструктор класса
     * 
     * @param PDO $db Объект соединения с базой данных
     */
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Регистрация нового пользователя
     * 
     * @param string $name Имя пользователя
     * @param string $email Email пользователя
     * @param string $password Пароль пользователя
     * @param string $phone Телефон пользователя
     * @return array Результат регистрации
     */
    public function register($name, $email, $password, $phone = '') {
        // Проверяем, существует ли пользователь с таким email
        if ($this->emailExists($email)) {
            return [
                'success' => false,
                'error' => 'Пользователь с таким email уже существует'
            ];
        }
        
        // Хешируем пароль
        $hashedPassword = Security::hashPassword($password);
        
        // Добавляем пользователя в базу данных
        $stmt = $this->db->prepare("
            INSERT INTO users (name, email, password, phone, role, status)
            VALUES (:name, :email, :password, :phone, :role, :status)
        ");
        
        $role = self::ROLE_USER;
        $status = self::STATUS_ACTIVE;
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':role', $role);
        $stmt->bindParam(':status', $status);
        
        if ($stmt->execute()) {
            $userId = $this->db->lastInsertId();
            
            // Загружаем данные пользователя
            $this->loadUserById($userId);
            
            return [
                'success' => true,
                'user_id' => $userId
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при регистрации пользователя'
            ];
        }
    }
    
    /**
     * Авторизация пользователя
     * 
     * @param string $email Email пользователя
     * @param string $password Пароль пользователя
     * @return array Результат авторизации
     */
    public function login($email, $password) {
        // Получаем пользователя по email
        $stmt = $this->db->prepare("
            SELECT * FROM users 
            WHERE email = :email
        ");
        
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [
                'success' => false,
                'error' => 'Пользователь с таким email не найден'
            ];
        }
        
        // Проверяем статус пользователя
        if ($user['status'] !== self::STATUS_ACTIVE) {
            return [
                'success' => false,
                'error' => 'Аккаунт пользователя неактивен'
            ];
        }
        
        // Проверяем пароль
        if (!Security::verifyPassword($password, $user['password'])) {
            return [
                'success' => false,
                'error' => 'Неверный пароль'
            ];
        }
        
        // Загружаем данные пользователя
        $this->loadUserData($user);
        
        // Генерируем токен сессии
        $sessionToken = Security::generateToken();
        
        // Сохраняем токен сессии в сессии
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['session_token'] = $sessionToken;
        $_SESSION['user_role'] = $user['role'];
        
        return [
            'success' => true,
            'user_id' => $user['id'],
            'session_token' => $sessionToken
        ];
    }
    
    /**
     * Выход пользователя
     * 
     * @return bool Результат выхода
     */
    public function logout() {
        // Очищаем сессию
        $_SESSION = [];
        
        // Уничтожаем сессию
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
        
        // Уничтожаем сессию
        session_destroy();
        
        return true;
    }
    
    /**
     * Проверка, существует ли пользователь с указанным email
     * 
     * @param string $email Email пользователя
     * @return bool Результат проверки
     */
    public function emailExists($email) {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM users 
            WHERE email = :email
        ");
        
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->fetchColumn() > 0;
    }
    
    /**
     * Загрузка данных пользователя по ID
     * 
     * @param int $userId ID пользователя
     * @return bool Результат загрузки
     */
    public function loadUserById($userId) {
        $stmt = $this->db->prepare("
            SELECT * FROM users 
            WHERE id = :id
        ");
        
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $this->loadUserData($user);
            return true;
        }
        
        return false;
    }
    
    /**
     * Загрузка данных пользователя из массива
     * 
     * @param array $user Данные пользователя
     */
    private function loadUserData($user) {
        $this->id = $user['id'];
        $this->name = $user['name'];
        $this->email = $user['email'];
        $this->phone = $user['phone'];
        $this->role = $user['role'];
        $this->status = $user['status'];
    }
    
    /**
     * Получение данных текущего пользователя
     * 
     * @return array Данные пользователя
     */
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }
        
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'status' => $this->status
        ];
    }
    
    /**
     * Проверка, авторизован ли пользователь
     * 
     * @return bool Результат проверки
     */
    public function isLoggedIn() {
        return isset($_SESSION['user_id']) && isset($_SESSION['session_token']);
    }
    
    /**
     * Проверка, является ли пользователь администратором
     * 
     * @return bool Результат проверки
     */
    public function isAdmin() {
        return $this->isLoggedIn() && $_SESSION['user_role'] === self::ROLE_ADMIN;
    }
    
    /**
     * Проверка, является ли пользователь менеджером
     * 
     * @return bool Результат проверки
     */
    public function isManager() {
        return $this->isLoggedIn() && ($_SESSION['user_role'] === self::ROLE_MANAGER || $_SESSION['user_role'] === self::ROLE_ADMIN);
    }
    
    /**
     * Обновление профиля пользователя
     * 
     * @param array $data Данные для обновления
     * @return array Результат обновления
     */
    public function updateProfile($data) {
        if (!$this->isLoggedIn()) {
            return [
                'success' => false,
                'error' => 'Пользователь не авторизован'
            ];
        }
        
        // Формируем SQL-запрос для обновления
        $sql = "UPDATE users SET ";
        $params = [];
        
        // Добавляем поля для обновления
        if (isset($data['name'])) {
            $sql .= "name = :name, ";
            $params[':name'] = $data['name'];
        }
        
        if (isset($data['phone'])) {
            $sql .= "phone = :phone, ";
            $params[':phone'] = $data['phone'];
        }
        
        // Если есть новый пароль, обновляем его
        if (isset($data['password']) && !empty($data['password'])) {
            $sql .= "password = :password, ";
            $params[':password'] = Security::hashPassword($data['password']);
        }
        
        // Удаляем последнюю запятую и пробел
        $sql = rtrim($sql, ", ");
        
        // Добавляем условие WHERE
        $sql .= " WHERE id = :id";
        $params[':id'] = $this->id;
        
        // Выполняем запрос
        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if ($stmt->execute()) {
            // Обновляем данные пользователя
            $this->loadUserById($this->id);
            
            return [
                'success' => true
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при обновлении профиля'
            ];
        }
    }
    
    /**
     * Получение истории бронирований пользователя
     * 
     * @return array История бронирований
     */
    public function getBookingHistory() {
        if (!$this->isLoggedIn()) {
            return [];
        }
        
        $stmt = $this->db->prepare("
            SELECT b.*, r.name as room_name, r.image as room_image
            FROM bookings b
            LEFT JOIN rooms r ON b.room_id = r.id
            WHERE b.email = :email
            ORDER BY b.created_at DESC
        ");
        
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Получение деталей бронирования
     * 
     * @param int $bookingId ID бронирования
     * @return array Детали бронирования
     */
    public function getBookingDetails($bookingId) {
        if (!$this->isLoggedIn()) {
            return null;
        }
        
        $stmt = $this->db->prepare("
            SELECT b.*, r.name as room_name, r.image as room_image
            FROM bookings b
            LEFT JOIN rooms r ON b.room_id = r.id
            WHERE b.id = :booking_id AND b.email = :email
        ");
        
        $stmt->bindParam(':booking_id', $bookingId);
        $stmt->bindParam(':email', $this->email);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Отмена бронирования
     * 
     * @param int $bookingId ID бронирования
     * @return array Результат отмены
     */
    public function cancelBooking($bookingId) {
        if (!$this->isLoggedIn()) {
            return [
                'success' => false,
                'error' => 'Пользователь не авторизован'
            ];
        }
        
        // Получаем информацию о бронировании
        $booking = $this->getBookingDetails($bookingId);
        
        if (!$booking) {
            return [
                'success' => false,
                'error' => 'Бронирование не найдено'
            ];
        }
        
        // Проверяем, можно ли отменить бронирование
        $checkInDate = new DateTime($booking['check_in_date']);
        $now = new DateTime();
        $interval = $now->diff($checkInDate);
        
        // Если до заезда осталось меньше 24 часов, отмена невозможна
        if ($interval->days < 1 && $checkInDate > $now) {
            return [
                'success' => false,
                'error' => 'Отмена бронирования невозможна менее чем за 24 часа до заезда'
            ];
        }
        
        // Если заезд уже состоялся, отмена невозможна
        if ($checkInDate <= $now) {
            return [
                'success' => false,
                'error' => 'Отмена бронирования невозможна после даты заезда'
            ];
        }
        
        // Отменяем бронирование
        $stmt = $this->db->prepare("
            UPDATE bookings 
            SET status = 'cancelled', updated_at = NOW() 
            WHERE id = :booking_id AND email = :email
        ");
        
        $stmt->bindParam(':booking_id', $bookingId);
        $stmt->bindParam(':email', $this->email);
        
        if ($stmt->execute()) {
            // Если бронирование было оплачено, создаем возврат
            if ($booking['payment_status'] === 'paid') {
                $this->createRefund($bookingId);
            }
            
            return [
                'success' => true
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при отмене бронирования'
            ];
        }
    }
    
    /**
     * Создание возврата платежа
     * 
     * @param int $bookingId ID бронирования
     * @return bool Результат создания возврата
     */
    private function createRefund($bookingId) {
        // Получаем информацию о платеже
        $stmt = $this->db->prepare("
            SELECT * FROM payments 
            WHERE booking_id = :booking_id AND status = 'completed'
            ORDER BY created_at DESC
            LIMIT 1
        ");
        
        $stmt->bindParam(':booking_id', $bookingId);
        $stmt->execute();
        
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$payment) {
            return false;
        }
        
        // Создаем экземпляр класса Payment
        require_once __DIR__ . '/payment.php';
        $paymentClass = new Payment($this->db);
        
        // Создаем возврат
        return $paymentClass->refundPayment($payment['payment_id']);
    }
    
    /**
     * Восстановление пароля
     * 
     * @param string $email Email пользователя
     * @return array Результат восстановления
     */
    public function resetPassword($email) {
        // Проверяем, существует ли пользователь с таким email
        if (!$this->emailExists($email)) {
            return [
                'success' => false,
                'error' => 'Пользователь с таким email не найден'
            ];
        }
        
        // Генерируем токен для сброса пароля
        $resetToken = Security::generateToken();
        $resetExpires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Сохраняем токен в базе данных
        $stmt = $this->db->prepare("
            UPDATE users 
            SET reset_token = :reset_token, reset_expires = :reset_expires 
            WHERE email = :email
        ");
        
        $stmt->bindParam(':reset_token', $resetToken);
        $stmt->bindParam(':reset_expires', $resetExpires);
        $stmt->bindParam(':email', $email);
        
        if ($stmt->execute()) {
            // Отправляем письмо со ссылкой для сброса пароля
            $resetLink = 'https://lesnoy-dvorik.ru/reset-password?token=' . $resetToken;
            
            $subject = 'Восстановление пароля в гостинице "Лесной дворик"';
            
            $message = "Уважаемый пользователь,\n\n";
            $message .= "Вы запросили восстановление пароля на сайте гостиницы \"Лесной дворик\".\n\n";
            $message .= "Для сброса пароля перейдите по ссылке: " . $resetLink . "\n\n";
            $message .= "Ссылка действительна в течение 1 часа.\n\n";
            $message .= "Если вы не запрашивали восстановление пароля, проигнорируйте это письмо.\n\n";
            $message .= "С уважением,\nКоманда гостиницы \"Лесной дворик\"";
            
            $headers = "From: noreply@lesnoy-dvorik.ru\r\n";
            $headers .= "Reply-To: info@lesnoy-dvorik.ru\r\n";
            
            mail($email, $subject, $message, $headers);
            
            return [
                'success' => true
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при восстановлении пароля'
            ];
        }
    }
    
    /**
     * Установка нового пароля
     * 
     * @param string $token Токен для сброса пароля
     * @param string $password Новый пароль
     * @return array Результат установки пароля
     */
    public function setNewPassword($token, $password) {
        // Проверяем токен
        $stmt = $this->db->prepare("
            SELECT * FROM users 
            WHERE reset_token = :token AND reset_expires > NOW()
        ");
        
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [
                'success' => false,
                'error' => 'Недействительный или устаревший токен'
            ];
        }
        
        // Хешируем новый пароль
        $hashedPassword = Security::hashPassword($password);
        
        // Обновляем пароль и сбрасываем токен
        $stmt = $this->db->prepare("
            UPDATE users 
            SET password = :password, reset_token = NULL, reset_expires = NULL 
            WHERE id = :id
        ");
        
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':id', $user['id']);
        
        if ($stmt->execute()) {
            return [
                'success' => true
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при установке нового пароля'
            ];
        }
    }
    
    /**
     * Получение списка пользователей (для администратора)
     * 
     * @param int $limit Лимит
     * @param int $offset Смещение
     * @return array Список пользователей
     */
    public function getUsers($limit = 10, $offset = 0) {
        if (!$this->isAdmin()) {
            return [];
        }
        
        $stmt = $this->db->prepare("
            SELECT id, name, email, phone, role, status, created_at, updated_at
            FROM users
            ORDER BY id DESC
            LIMIT :limit OFFSET :offset
        ");
        
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Получение количества пользователей (для администратора)
     * 
     * @return int Количество пользователей
     */
    public function getUsersCount() {
        if (!$this->isAdmin()) {
            return 0;
        }
        
        $stmt = $this->db->query("SELECT COUNT(*) FROM users");
        
        return $stmt->fetchColumn();
    }
    
    /**
     * Обновление пользователя (для администратора)
     * 
     * @param int $userId ID пользователя
     * @param array $data Данные для обновления
     * @return array Результат обновления
     */
    public function updateUser($userId, $data) {
        if (!$this->isAdmin()) {
            return [
                'success' => false,
                'error' => 'Недостаточно прав'
            ];
        }
        
        // Формируем SQL-запрос для обновления
        $sql = "UPDATE users SET ";
        $params = [];
        
        // Добавляем поля для обновления
        if (isset($data['name'])) {
            $sql .= "name = :name, ";
            $params[':name'] = $data['name'];
        }
        
        if (isset($data['phone'])) {
            $sql .= "phone = :phone, ";
            $params[':phone'] = $data['phone'];
        }
        
        if (isset($data['role'])) {
            $sql .= "role = :role, ";
            $params[':role'] = $data['role'];
        }
        
        if (isset($data['status'])) {
            $sql .= "status = :status, ";
            $params[':status'] = $data['status'];
        }
        
        // Если есть новый пароль, обновляем его
        if (isset($data['password']) && !empty($data['password'])) {
            $sql .= "password = :password, ";
            $params[':password'] = Security::hashPassword($data['password']);
        }
        
        // Удаляем последнюю запятую и пробел
        $sql = rtrim($sql, ", ");
        
        // Добавляем условие WHERE
        $sql .= " WHERE id = :id";
        $params[':id'] = $userId;
        
        // Выполняем запрос
        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if ($stmt->execute()) {
            return [
                'success' => true
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при обновлении пользователя'
            ];
        }
    }
    
    /**
     * Удаление пользователя (для администратора)
     * 
     * @param int $userId ID пользователя
     * @return array Результат удаления
     */
    public function deleteUser($userId) {
        if (!$this->isAdmin()) {
            return [
                'success' => false,
                'error' => 'Недостаточно прав'
            ];
        }
        
        // Проверяем, не пытается ли администратор удалить самого себя
        if ($userId == $this->id) {
            return [
                'success' => false,
                'error' => 'Невозможно удалить собственный аккаунт'
            ];
        }
        
        // Удаляем пользователя
        $stmt = $this->db->prepare("
            DELETE FROM users 
            WHERE id = :id
        ");
        
        $stmt->bindParam(':id', $userId);
        
        if ($stmt->execute()) {
            return [
                'success' => true
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Ошибка при удалении пользователя'
            ];
        }
    }
} 