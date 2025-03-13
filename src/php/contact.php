<?php
/**
 * Обработчик формы обратной связи для гостиницы "Лесной дворик"
 */

// Подключение конфигурации базы данных
require_once '../includes/db_config.php';

/**
 * Функция для очистки и валидации входных данных
 * 
 * @param string $data Входные данные
 * @return string Очищенные данные
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получение данных из формы
    $name = isset($_POST['name']) ? sanitizeInput($_POST['name']) : '';
    $email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
    $phone = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : '';
    $subject = isset($_POST['subject']) ? sanitizeInput($_POST['subject']) : 'Сообщение с сайта';
    $message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';
    
    // Массив для хранения ошибок
    $errors = [];
    
    // Валидация данных
    if (empty($name)) {
        $errors[] = 'Пожалуйста, укажите ваше имя';
    }
    
    if (empty($email)) {
        $errors[] = 'Пожалуйста, укажите ваш email';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Пожалуйста, укажите корректный email';
    }
    
    if (empty($message)) {
        $errors[] = 'Пожалуйста, введите сообщение';
    }
    
    // Если есть ошибки, возвращаем их
    if (!empty($errors)) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'errors' => $errors
        ]);
        exit;
    }
    
    try {
        // Создание записи в базе данных
        $contactData = [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'subject' => $subject,
            'message' => $message,
            'created_at' => date('Y-m-d H:i:s'),
            'status' => 'new'
        ];
        
        // Вставка данных в таблицу контактов
        $contactId = insert('contacts', $contactData);
        
        // Отправка уведомления администратору
        $adminSubject = "Новое сообщение с сайта: {$subject}";
        $adminMessage = "Получено новое сообщение от посетителя сайта:\n\n";
        $adminMessage .= "Имя: {$name}\n";
        $adminMessage .= "Email: {$email}\n";
        $adminMessage .= "Телефон: {$phone}\n";
        $adminMessage .= "Тема: {$subject}\n";
        $adminMessage .= "Сообщение: {$message}\n\n";
        $adminMessage .= "Дата: " . date('d.m.Y H:i:s') . "\n";
        
        $headers = "From: {$email}\r\n";
        $headers .= "Reply-To: {$email}\r\n";
        
        // Отправка email администратору
        mail(ADMIN_EMAIL, $adminSubject, $adminMessage, $headers);
        
        // Отправка подтверждения клиенту
        $clientSubject = "Ваше сообщение получено - Гостиница \"Лесной дворик\"";
        $clientMessage = "Уважаемый(ая) {$name},\n\n";
        $clientMessage .= "Благодарим вас за обращение в гостиницу \"Лесной дворик\".\n";
        $clientMessage .= "Ваше сообщение успешно получено и будет обработано в ближайшее время.\n\n";
        $clientMessage .= "С уважением,\n";
        $clientMessage .= "Администрация гостиницы \"Лесной дворик\"\n";
        
        $clientHeaders = "From: " . ADMIN_EMAIL . "\r\n";
        
        // Отправка email клиенту
        mail($email, $clientSubject, $clientMessage, $clientHeaders);
        
        // Возвращаем успешный ответ
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.'
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при обработке формы обратной связи: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.'
        ]);
    }
    
} else {
    // Если запрос не POST, перенаправляем на главную страницу
    header('Location: /');
    exit;
} 