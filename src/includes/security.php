<?php
/**
 * Класс для обработки безопасности
 * Гостиница "Лесной дворик"
 */

class Security {
    /**
     * Очистка входных данных от потенциально опасных символов
     * 
     * @param mixed $data Данные для очистки
     * @return mixed Очищенные данные
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = self::sanitize($value);
            }
            return $data;
        }
        
        if (is_string($data)) {
            $data = trim($data);
            $data = stripslashes($data);
            $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        }
        
        return $data;
    }
    
    /**
     * Проверка CSRF-токена
     * 
     * @param string $token Токен из формы
     * @return bool Результат проверки
     */
    public static function validateCSRFToken($token) {
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Генерация CSRF-токена
     * 
     * @return string Сгенерированный токен
     */
    public static function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Проверка валидности email
     * 
     * @param string $email Email для проверки
     * @return bool Результат проверки
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Проверка валидности телефона
     * 
     * @param string $phone Телефон для проверки
     * @return bool Результат проверки
     */
    public static function validatePhone($phone) {
        // Удаляем все нецифровые символы
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Проверяем длину (от 10 до 15 цифр)
        return strlen($phone) >= 10 && strlen($phone) <= 15;
    }
    
    /**
     * Проверка валидности даты
     * 
     * @param string $date Дата для проверки в формате YYYY-MM-DD
     * @return bool Результат проверки
     */
    public static function validateDate($date) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return false;
        }
        
        $parts = explode('-', $date);
        return checkdate($parts[1], $parts[2], $parts[0]);
    }
    
    /**
     * Безопасное сравнение дат
     * 
     * @param string $date1 Первая дата в формате YYYY-MM-DD
     * @param string $date2 Вторая дата в формате YYYY-MM-DD
     * @param string $operator Оператор сравнения (>, <, >=, <=, ==, !=)
     * @return bool Результат сравнения
     */
    public static function compareDates($date1, $date2, $operator = '>') {
        if (!self::validateDate($date1) || !self::validateDate($date2)) {
            return false;
        }
        
        $timestamp1 = strtotime($date1);
        $timestamp2 = strtotime($date2);
        
        switch ($operator) {
            case '>':
                return $timestamp1 > $timestamp2;
            case '<':
                return $timestamp1 < $timestamp2;
            case '>=':
                return $timestamp1 >= $timestamp2;
            case '<=':
                return $timestamp1 <= $timestamp2;
            case '==':
                return $timestamp1 == $timestamp2;
            case '!=':
                return $timestamp1 != $timestamp2;
            default:
                return false;
        }
    }
    
    /**
     * Защита от XSS при выводе данных
     * 
     * @param string $data Данные для вывода
     * @return string Безопасные данные
     */
    public static function escapeOutput($data) {
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Безопасный вывод HTML-контента
     * 
     * @param string $html HTML-контент
     * @return string Очищенный HTML-контент
     */
    public static function purifyHTML($html) {
        // Базовая очистка HTML от опасных тегов и атрибутов
        $allowedTags = [
            'a' => ['href', 'title', 'target', 'rel'],
            'p' => [],
            'br' => [],
            'b' => [],
            'i' => [],
            'strong' => [],
            'em' => [],
            'ul' => [],
            'ol' => [],
            'li' => [],
            'h1' => [],
            'h2' => [],
            'h3' => [],
            'h4' => [],
            'h5' => [],
            'h6' => [],
            'blockquote' => [],
            'img' => ['src', 'alt', 'title', 'width', 'height']
        ];
        
        // Используем DOMDocument для очистки HTML
        $dom = new DOMDocument();
        
        // Подавляем ошибки при загрузке HTML
        libxml_use_internal_errors(true);
        $dom->loadHTML('<div>' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        
        // Рекурсивно обходим все узлы и удаляем запрещенные теги и атрибуты
        self::cleanDOMNode($dom->documentElement, $allowedTags);
        
        // Получаем очищенный HTML
        $cleanHtml = '';
        $body = $dom->getElementsByTagName('div')->item(0);
        
        if ($body) {
            $children = $body->childNodes;
            foreach ($children as $child) {
                $cleanHtml .= $dom->saveHTML($child);
            }
        }
        
        return $cleanHtml;
    }
    
    /**
     * Рекурсивная очистка DOM-узла
     * 
     * @param DOMNode $node Узел для очистки
     * @param array $allowedTags Разрешенные теги и атрибуты
     */
    private static function cleanDOMNode($node, $allowedTags) {
        if (!$node) {
            return;
        }
        
        // Получаем список дочерних узлов (создаем копию, так как список будет изменяться)
        $childNodes = [];
        foreach ($node->childNodes as $child) {
            $childNodes[] = $child;
        }
        
        // Обрабатываем каждый дочерний узел
        foreach ($childNodes as $child) {
            // Если это элемент (тег)
            if ($child->nodeType === XML_ELEMENT_NODE) {
                $tagName = strtolower($child->nodeName);
                
                // Если тег не разрешен, заменяем его содержимое текстовыми узлами
                if (!isset($allowedTags[$tagName])) {
                    // Создаем текстовый узел с содержимым тега
                    $textContent = $child->textContent;
                    $textNode = $node->ownerDocument->createTextNode($textContent);
                    
                    // Заменяем тег текстовым узлом
                    $node->replaceChild($textNode, $child);
                } else {
                    // Тег разрешен, проверяем его атрибуты
                    $allowedAttributes = $allowedTags[$tagName];
                    
                    // Получаем список атрибутов (создаем копию)
                    $attributes = [];
                    foreach ($child->attributes as $attr) {
                        $attributes[] = $attr;
                    }
                    
                    // Удаляем запрещенные атрибуты
                    foreach ($attributes as $attr) {
                        $attrName = strtolower($attr->nodeName);
                        if (!in_array($attrName, $allowedAttributes)) {
                            $child->removeAttribute($attr->nodeName);
                        }
                    }
                    
                    // Рекурсивно обрабатываем дочерние узлы
                    self::cleanDOMNode($child, $allowedTags);
                }
            }
        }
    }
    
    /**
     * Генерация безопасного пароля
     * 
     * @param int $length Длина пароля
     * @return string Сгенерированный пароль
     */
    public static function generatePassword($length = 12) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        return $password;
    }
    
    /**
     * Хеширование пароля
     * 
     * @param string $password Пароль для хеширования
     * @return string Хеш пароля
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    /**
     * Проверка пароля
     * 
     * @param string $password Пароль для проверки
     * @param string $hash Хеш пароля
     * @return bool Результат проверки
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Генерация случайного токена
     * 
     * @param int $length Длина токена
     * @return string Сгенерированный токен
     */
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length / 2));
    }
    
    /**
     * Проверка силы пароля
     * 
     * @param string $password Пароль для проверки
     * @return array Результат проверки с оценкой и рекомендациями
     */
    public static function checkPasswordStrength($password) {
        $score = 0;
        $feedback = [];
        
        // Проверка длины
        if (strlen($password) < 8) {
            $feedback[] = 'Пароль должен содержать не менее 8 символов';
        } else {
            $score += 1;
        }
        
        // Проверка наличия цифр
        if (!preg_match('/[0-9]/', $password)) {
            $feedback[] = 'Пароль должен содержать хотя бы одну цифру';
        } else {
            $score += 1;
        }
        
        // Проверка наличия строчных букв
        if (!preg_match('/[a-z]/', $password)) {
            $feedback[] = 'Пароль должен содержать хотя бы одну строчную букву';
        } else {
            $score += 1;
        }
        
        // Проверка наличия заглавных букв
        if (!preg_match('/[A-Z]/', $password)) {
            $feedback[] = 'Пароль должен содержать хотя бы одну заглавную букву';
        } else {
            $score += 1;
        }
        
        // Проверка наличия специальных символов
        if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
            $feedback[] = 'Пароль должен содержать хотя бы один специальный символ';
        } else {
            $score += 1;
        }
        
        // Определение уровня безопасности
        $strength = 'слабый';
        if ($score >= 3) {
            $strength = 'средний';
        }
        if ($score >= 5) {
            $strength = 'сильный';
        }
        
        return [
            'score' => $score,
            'strength' => $strength,
            'feedback' => $feedback
        ];
    }
} 