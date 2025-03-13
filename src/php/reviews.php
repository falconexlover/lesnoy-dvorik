<?php
/**
 * Обработчик формы отзывов для гостиницы "Лесной дворик"
 * 
 * Этот скрипт обрабатывает отправку отзывов с сайта,
 * сохраняет их в базу данных и отправляет уведомление администратору
 */

// Подключение к базе данных
require_once 'db_connect.php';

// Функция для очистки входных данных
function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Проверка метода запроса
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Получение данных из формы
    $name = isset($_POST['name']) ? clean_input($_POST['name']) : '';
    $email = isset($_POST['email']) ? clean_input($_POST['email']) : '';
    $rating = isset($_POST['rating']) ? intval($_POST['rating']) : 0;
    $category = isset($_POST['category']) ? clean_input($_POST['category']) : '';
    $review_text = isset($_POST['review_text']) ? clean_input($_POST['review_text']) : '';
    $privacy = isset($_POST['privacy']) ? 1 : 0;
    
    // Валидация данных
    $errors = [];
    
    if (empty($name)) {
        $errors[] = "Имя обязательно для заполнения";
    }
    
    if (empty($email)) {
        $errors[] = "Email обязательно для заполнения";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Неверный формат email";
    }
    
    if ($rating < 1 || $rating > 5) {
        $errors[] = "Оценка должна быть от 1 до 5";
    }
    
    if (empty($category)) {
        $errors[] = "Категория обязательна для заполнения";
    }
    
    if (empty($review_text)) {
        $errors[] = "Текст отзыва обязателен для заполнения";
    }
    
    if (!$privacy) {
        $errors[] = "Необходимо согласие с политикой конфиденциальности";
    }
    
    // Если есть ошибки, возвращаем их
    if (!empty($errors)) {
        $response = [
            'success' => false,
            'errors' => $errors
        ];
        
        // Возвращаем ответ в формате JSON
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    }
    
    try {
        // Подготовка SQL запроса для вставки отзыва
        $sql = "INSERT INTO reviews (name, email, rating, category, review_text, status, created_at) 
                VALUES (:name, :email, :rating, :category, :review_text, 'pending', NOW())";
        
        $stmt = $pdo->prepare($sql);
        
        // Привязка параметров
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':rating', $rating);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':review_text', $review_text);
        
        // Выполнение запроса
        $stmt->execute();
        
        // Получение ID вставленной записи
        $review_id = $pdo->lastInsertId();
        
        // Отправка уведомления администратору
        $admin_email = 'admin@lesnoy-dvorik.ru';
        $subject = 'Новый отзыв на сайте "Лесной дворик"';
        
        $message = "Получен новый отзыв на сайте:\n\n";
        $message .= "Имя: " . $name . "\n";
        $message .= "Email: " . $email . "\n";
        $message .= "Оценка: " . $rating . "\n";
        $message .= "Категория: " . $category . "\n";
        $message .= "Отзыв: " . $review_text . "\n\n";
        $message .= "Для модерации отзыва перейдите по ссылке: " . 
                    "https://lesnoy-dvorik.ru/admin/reviews.php?id=" . $review_id;
        
        $headers = "From: noreply@lesnoy-dvorik.ru" . "\r\n" .
                   "Reply-To: " . $email . "\r\n" .
                   "X-Mailer: PHP/" . phpversion();
        
        mail($admin_email, $subject, $message, $headers);
        
        // Формирование успешного ответа
        $response = [
            'success' => true,
            'message' => 'Спасибо за ваш отзыв! Он будет опубликован после проверки модератором.'
        ];
        
    } catch (PDOException $e) {
        // В случае ошибки базы данных
        $response = [
            'success' => false,
            'errors' => ['Произошла ошибка при сохранении отзыва. Пожалуйста, попробуйте позже.']
        ];
        
        // Логирование ошибки
        error_log('Database Error: ' . $e->getMessage());
    }
    
    // Возвращаем ответ в формате JSON
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
    
} else {
    // Если запрос не POST, перенаправляем на страницу отзывов
    header('Location: ../pages/reviews.html');
    exit;
}