<?php
/**
 * Класс для работы с платежной системой
 * Гостиница "Лесной дворик"
 */

class Payment {
    // Константы для статусов платежей
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';
    
    // Константы для платежных систем
    const PROVIDER_YOOKASSA = 'yookassa';
    const PROVIDER_SBERBANK = 'sberbank';
    const PROVIDER_TINKOFF = 'tinkoff';
    
    // Настройки платежной системы
    private $provider;
    private $apiKey;
    private $secretKey;
    private $testMode;
    private $db;
    
    /**
     * Конструктор класса
     * 
     * @param PDO $db Объект соединения с базой данных
     * @param string $provider Платежная система
     * @param bool $testMode Режим тестирования
     */
    public function __construct($db, $provider = self::PROVIDER_YOOKASSA, $testMode = true) {
        $this->db = $db;
        $this->provider = $provider;
        $this->testMode = $testMode;
        
        // Загружаем настройки платежной системы
        $this->loadConfig();
    }
    
    /**
     * Загрузка настроек платежной системы
     */
    private function loadConfig() {
        switch ($this->provider) {
            case self::PROVIDER_YOOKASSA:
                $this->apiKey = getenv('YOOKASSA_API_KEY') ?: '123456';
                $this->secretKey = getenv('YOOKASSA_SECRET_KEY') ?: 'test_secret_key';
                break;
            case self::PROVIDER_SBERBANK:
                $this->apiKey = getenv('SBERBANK_API_KEY') ?: '123456';
                $this->secretKey = getenv('SBERBANK_SECRET_KEY') ?: 'test_secret_key';
                break;
            case self::PROVIDER_TINKOFF:
                $this->apiKey = getenv('TINKOFF_API_KEY') ?: '123456';
                $this->secretKey = getenv('TINKOFF_SECRET_KEY') ?: 'test_secret_key';
                break;
            default:
                throw new Exception('Неизвестная платежная система');
        }
    }
    
    /**
     * Создание платежа
     * 
     * @param int $bookingId ID бронирования
     * @param float $amount Сумма платежа
     * @param string $description Описание платежа
     * @param string $returnUrl URL для возврата после оплаты
     * @param string $cancelUrl URL для возврата при отмене
     * @return array Данные платежа
     */
    public function createPayment($bookingId, $amount, $description, $returnUrl, $cancelUrl) {
        // Генерируем уникальный идентификатор платежа
        $paymentId = uniqid('payment_');
        
        // В реальном проекте здесь будет вызов API платежной системы
        // Для демонстрации создаем заглушку
        
        // Сохраняем информацию о платеже в базу данных
        $stmt = $this->db->prepare("
            INSERT INTO payments (
                booking_id, payment_id, amount, description, 
                provider, status, created_at
            ) VALUES (
                :booking_id, :payment_id, :amount, :description, 
                :provider, :status, NOW()
            )
        ");
        
        $status = self::STATUS_PENDING;
        
        $stmt->bindParam(':booking_id', $bookingId);
        $stmt->bindParam(':payment_id', $paymentId);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':provider', $this->provider);
        $stmt->bindParam(':status', $status);
        
        $stmt->execute();
        
        // Формируем URL для оплаты
        $paymentUrl = $this->getPaymentUrl($paymentId, $amount, $description, $returnUrl, $cancelUrl);
        
        return [
            'payment_id' => $paymentId,
            'amount' => $amount,
            'description' => $description,
            'status' => $status,
            'payment_url' => $paymentUrl
        ];
    }
    
    /**
     * Получение URL для оплаты
     * 
     * @param string $paymentId ID платежа
     * @param float $amount Сумма платежа
     * @param string $description Описание платежа
     * @param string $returnUrl URL для возврата после оплаты
     * @param string $cancelUrl URL для возврата при отмене
     * @return string URL для оплаты
     */
    private function getPaymentUrl($paymentId, $amount, $description, $returnUrl, $cancelUrl) {
        // В реальном проекте здесь будет формирование URL для оплаты
        // Для демонстрации создаем заглушку
        
        $baseUrl = 'https://example.com/payment';
        
        switch ($this->provider) {
            case self::PROVIDER_YOOKASSA:
                return $baseUrl . '/yookassa?' . http_build_query([
                    'payment_id' => $paymentId,
                    'amount' => $amount,
                    'description' => $description,
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl,
                    'test_mode' => $this->testMode ? 1 : 0
                ]);
            case self::PROVIDER_SBERBANK:
                return $baseUrl . '/sberbank?' . http_build_query([
                    'payment_id' => $paymentId,
                    'amount' => $amount,
                    'description' => $description,
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl,
                    'test_mode' => $this->testMode ? 1 : 0
                ]);
            case self::PROVIDER_TINKOFF:
                return $baseUrl . '/tinkoff?' . http_build_query([
                    'payment_id' => $paymentId,
                    'amount' => $amount,
                    'description' => $description,
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl,
                    'test_mode' => $this->testMode ? 1 : 0
                ]);
            default:
                return $baseUrl . '/demo?' . http_build_query([
                    'payment_id' => $paymentId,
                    'amount' => $amount,
                    'description' => $description,
                    'return_url' => $returnUrl,
                    'cancel_url' => $cancelUrl,
                    'test_mode' => $this->testMode ? 1 : 0
                ]);
        }
    }
    
    /**
     * Получение информации о платеже
     * 
     * @param string $paymentId ID платежа
     * @return array Информация о платеже
     */
    public function getPayment($paymentId) {
        $stmt = $this->db->prepare("
            SELECT * FROM payments 
            WHERE payment_id = :payment_id
        ");
        
        $stmt->bindParam(':payment_id', $paymentId);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Обновление статуса платежа
     * 
     * @param string $paymentId ID платежа
     * @param string $status Новый статус
     * @return bool Результат обновления
     */
    public function updatePaymentStatus($paymentId, $status) {
        $stmt = $this->db->prepare("
            UPDATE payments 
            SET status = :status, updated_at = NOW() 
            WHERE payment_id = :payment_id
        ");
        
        $stmt->bindParam(':payment_id', $paymentId);
        $stmt->bindParam(':status', $status);
        
        return $stmt->execute();
    }
    
    /**
     * Обработка уведомления от платежной системы
     * 
     * @param array $data Данные уведомления
     * @return bool Результат обработки
     */
    public function handleNotification($data) {
        // В реальном проекте здесь будет обработка уведомления от платежной системы
        // Для демонстрации создаем заглушку
        
        if (!isset($data['payment_id']) || !isset($data['status'])) {
            return false;
        }
        
        $paymentId = $data['payment_id'];
        $status = $data['status'];
        
        // Проверяем подпись уведомления
        if (!$this->verifyNotification($data)) {
            return false;
        }
        
        // Обновляем статус платежа
        $this->updatePaymentStatus($paymentId, $status);
        
        // Если платеж успешно завершен, обновляем статус бронирования
        if ($status === self::STATUS_COMPLETED) {
            $this->updateBookingStatus($paymentId);
        }
        
        return true;
    }
    
    /**
     * Проверка подписи уведомления
     * 
     * @param array $data Данные уведомления
     * @return bool Результат проверки
     */
    private function verifyNotification($data) {
        // В реальном проекте здесь будет проверка подписи уведомления
        // Для демонстрации всегда возвращаем true
        return true;
    }
    
    /**
     * Обновление статуса бронирования
     * 
     * @param string $paymentId ID платежа
     * @return bool Результат обновления
     */
    private function updateBookingStatus($paymentId) {
        // Получаем информацию о платеже
        $payment = $this->getPayment($paymentId);
        
        if (!$payment) {
            return false;
        }
        
        // Обновляем статус бронирования
        $stmt = $this->db->prepare("
            UPDATE bookings 
            SET payment_status = 'paid', status = 'confirmed', updated_at = NOW() 
            WHERE id = :booking_id
        ");
        
        $stmt->bindParam(':booking_id', $payment['booking_id']);
        
        return $stmt->execute();
    }
    
    /**
     * Возврат платежа
     * 
     * @param string $paymentId ID платежа
     * @param float $amount Сумма возврата (если не указана, возвращается вся сумма)
     * @return bool Результат возврата
     */
    public function refundPayment($paymentId, $amount = null) {
        // Получаем информацию о платеже
        $payment = $this->getPayment($paymentId);
        
        if (!$payment) {
            return false;
        }
        
        // Если сумма не указана, возвращаем всю сумму
        if ($amount === null) {
            $amount = $payment['amount'];
        }
        
        // В реальном проекте здесь будет вызов API платежной системы
        // Для демонстрации создаем заглушку
        
        // Обновляем статус платежа
        $this->updatePaymentStatus($paymentId, self::STATUS_REFUNDED);
        
        // Обновляем статус бронирования
        $stmt = $this->db->prepare("
            UPDATE bookings 
            SET payment_status = 'refunded', updated_at = NOW() 
            WHERE id = :booking_id
        ");
        
        $stmt->bindParam(':booking_id', $payment['booking_id']);
        
        return $stmt->execute();
    }
    
    /**
     * Получение списка платежей для бронирования
     * 
     * @param int $bookingId ID бронирования
     * @return array Список платежей
     */
    public function getPaymentsByBooking($bookingId) {
        $stmt = $this->db->prepare("
            SELECT * FROM payments 
            WHERE booking_id = :booking_id 
            ORDER BY created_at DESC
        ");
        
        $stmt->bindParam(':booking_id', $bookingId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Получение статистики платежей
     * 
     * @param string $period Период (day, week, month, year)
     * @return array Статистика платежей
     */
    public function getPaymentStats($period = 'month') {
        $sql = "
            SELECT 
                COUNT(*) as total_count,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
                COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_count,
                SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as refunded_amount
            FROM payments
        ";
        
        switch ($period) {
            case 'day':
                $sql .= " WHERE DATE(created_at) = CURDATE()";
                break;
            case 'week':
                $sql .= " WHERE YEARWEEK(created_at) = YEARWEEK(CURDATE())";
                break;
            case 'month':
                $sql .= " WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
                break;
            case 'year':
                $sql .= " WHERE YEAR(created_at) = YEAR(CURDATE())";
                break;
        }
        
        $stmt = $this->db->query($sql);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
} 