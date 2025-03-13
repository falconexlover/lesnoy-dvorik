<?php
/**
 * Страница модерации отзывов для гостиницы "Лесной дворик"
 * 
 * Эта страница позволяет администраторам просматривать, одобрять, 
 * редактировать и удалять отзывы пользователей
 */

// Проверка авторизации
require_once '../includes/auth.php';
if (!isAdmin()) {
    header('Location: login.php');
    exit;
}

// Подключение к базе данных
require_once '../php/db_connect.php';

// Обработка действий с отзывами
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';
    $review_id = isset($_POST['review_id']) ? intval($_POST['review_id']) : 0;
    
    if ($review_id > 0) {
        try {
            switch ($action) {
                case 'approve':
                    // Одобрение отзыва
                    $stmt = $pdo->prepare("UPDATE reviews SET status = 'approved' WHERE id = :id");
                    $stmt->bindParam(':id', $review_id);
                    $stmt->execute();
                    $message = 'Отзыв успешно одобрен';
                    break;
                    
                case 'reject':
                    // Отклонение отзыва
                    $stmt = $pdo->prepare("UPDATE reviews SET status = 'rejected' WHERE id = :id");
                    $stmt->bindParam(':id', $review_id);
                    $stmt->execute();
                    $message = 'Отзыв отклонен';
                    break;
                    
                case 'delete':
                    // Удаление отзыва
                    $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = :id");
                    $stmt->bindParam(':id', $review_id);
                    $stmt->execute();
                    $message = 'Отзыв удален';
                    break;
                    
                case 'edit':
                    // Редактирование отзыва
                    $name = isset($_POST['name']) ? $_POST['name'] : '';
                    $rating = isset($_POST['rating']) ? intval($_POST['rating']) : 5;
                    $category = isset($_POST['category']) ? $_POST['category'] : '';
                    $review_text = isset($_POST['review_text']) ? $_POST['review_text'] : '';
                    
                    $stmt = $pdo->prepare("UPDATE reviews SET name = :name, rating = :rating, 
                                          category = :category, review_text = :review_text 
                                          WHERE id = :id");
                    $stmt->bindParam(':name', $name);
                    $stmt->bindParam(':rating', $rating);
                    $stmt->bindParam(':category', $category);
                    $stmt->bindParam(':review_text', $review_text);
                    $stmt->bindParam(':id', $review_id);
                    $stmt->execute();
                    $message = 'Отзыв успешно отредактирован';
                    break;
                    
                default:
                    $message = 'Неизвестное действие';
            }
        } catch (PDOException $e) {
            $error = 'Ошибка при обработке запроса: ' . $e->getMessage();
        }
    } else {
        $error = 'Неверный ID отзыва';
    }
}

// Получение отзыва для редактирования
$edit_review = null;
if (isset($_GET['edit']) && intval($_GET['edit']) > 0) {
    $edit_id = intval($_GET['edit']);
    $stmt = $pdo->prepare("SELECT * FROM reviews WHERE id = :id");
    $stmt->bindParam(':id', $edit_id);
    $stmt->execute();
    $edit_review = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Получение списка отзывов с пагинацией
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 10;
$offset = ($page - 1) * $limit;

// Фильтр по статусу
$status_filter = isset($_GET['status']) ? $_GET['status'] : 'all';
$status_condition = ($status_filter !== 'all') ? "WHERE status = :status" : "";

// Подсчет общего количества отзывов
$count_sql = "SELECT COUNT(*) FROM reviews " . $status_condition;
$count_stmt = $pdo->prepare($count_sql);
if ($status_filter !== 'all') {
    $count_stmt->bindParam(':status', $status_filter);
}
$count_stmt->execute();
$total_reviews = $count_stmt->fetchColumn();
$total_pages = ceil($total_reviews / $limit);

// Получение отзывов
$sql = "SELECT * FROM reviews " . $status_condition . " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);
if ($status_filter !== 'all') {
    $stmt->bindParam(':status', $status_filter);
}
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Получение статистики по отзывам
$stats_sql = "SELECT status, COUNT(*) as count FROM reviews GROUP BY status";
$stats_stmt = $pdo->prepare($stats_sql);
$stats_stmt->execute();
$stats = $stats_stmt->fetchAll(PDO::FETCH_ASSOC);

$stats_data = [
    'pending' => 0,
    'approved' => 0,
    'rejected' => 0
];

foreach ($stats as $stat) {
    $stats_data[$stat['status']] = $stat['count'];
}

$total_count = array_sum($stats_data);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Модерация отзывов - Админ панель</title>
    <link rel="stylesheet" href="css/admin.css">
    <style>
        .review-card {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .review-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .review-info {
            flex: 1;
        }
        
        .review-name {
            font-weight: bold;
            font-size: 18px;
        }
        
        .review-meta {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
        }
        
        .review-rating {
            color: #f39c12;
            font-size: 18px;
        }
        
        .review-text {
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .review-actions {
            display: flex;
            gap: 10px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-pending {
            background-color: #f39c12;
            color: #fff;
        }
        
        .status-approved {
            background-color: #2ecc71;
            color: #fff;
        }
        
        .status-rejected {
            background-color: #e74c3c;
            color: #fff;
        }
        
        .stats-container {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            flex: 1;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            padding: 15px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 14px;
        }
        
        .stat-pending .stat-number {
            color: #f39c12;
        }
        
        .stat-approved .stat-number {
            color: #2ecc71;
        }
        
        .stat-rejected .stat-number {
            color: #e74c3c;
        }
        
        .stat-total .stat-number {
            color: #3498db;
        }
        
        .filter-container {
            margin-bottom: 20px;
        }
        
        .edit-form {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        .form-control {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        textarea.form-control {
            min-height: 100px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 30px;
        }
        
        .pagination a, .pagination span {
            display: inline-block;
            padding: 8px 12px;
            margin: 0 5px;
            border-radius: 4px;
            background-color: #fff;
            border: 1px solid #ddd;
            color: #333;
            text-decoration: none;
        }
        
        .pagination a:hover {
            background-color: #f5f5f5;
        }
        
        .pagination .active {
            background-color: #3498db;
            color: #fff;
            border-color: #3498db;
        }
        
        .pagination .disabled {
            color: #aaa;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <?php include 'includes/sidebar.php'; ?>
        
        <div class="admin-content">
            <div class="admin-header">
                <h1>Модерация отзывов</h1>
                <div class="admin-actions">
                    <a href="index.php" class="btn btn-secondary">Назад к панели</a>
                </div>
            </div>
            
            <?php if (isset($message)): ?>
                <div class="alert alert-success">
                    <?php echo $message; ?>
                </div>
            <?php endif; ?>
            
            <?php if (isset($error)): ?>
                <div class="alert alert-danger">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <div class="stats-container">
                <div class="stat-card stat-pending">
                    <div class="stat-number"><?php echo $stats_data['pending']; ?></div>
                    <div class="stat-label">Ожидают модерации</div>
                </div>
                <div class="stat-card stat-approved">
                    <div class="stat-number"><?php echo $stats_data['approved']; ?></div>
                    <div class="stat-label">Одобрено</div>
                </div>
                <div class="stat-card stat-rejected">
                    <div class="stat-number"><?php echo $stats_data['rejected']; ?></div>
                    <div class="stat-label">Отклонено</div>
                </div>
                <div class="stat-card stat-total">
                    <div class="stat-number"><?php echo $total_count; ?></div>
                    <div class="stat-label">Всего отзывов</div>
                </div>
            </div>
            
            <div class="filter-container">
                <form action="" method="get" class="form-inline">
                    <label for="status">Фильтр по статусу:</label>
                    <select name="status" id="status" class="form-control" onchange="this.form.submit()">
                        <option value="all" <?php echo $status_filter === 'all' ? 'selected' : ''; ?>>Все отзывы</option>
                        <option value="pending" <?php echo $status_filter === 'pending' ? 'selected' : ''; ?>>Ожидают модерации</option>
                        <option value="approved" <?php echo $status_filter === 'approved' ? 'selected' : ''; ?>>Одобренные</option>
                        <option value="rejected" <?php echo $status_filter === 'rejected' ? 'selected' : ''; ?>>Отклоненные</option>
                    </select>
                </form>
            </div>
            
            <?php if ($edit_review): ?>
                <div class="edit-form">
                    <h2>Редактирование отзыва</h2>
                    <form action="" method="post">
                        <input type="hidden" name="action" value="edit">
                        <input type="hidden" name="review_id" value="<?php echo $edit_review['id']; ?>">
                        
                        <div class="form-group">
                            <label for="name">Имя</label>
                            <input type="text" id="name" name="name" class="form-control" value="<?php echo htmlspecialchars($edit_review['name']); ?>" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="rating">Оценка</label>
                            <select id="rating" name="rating" class="form-control" required>
                                <?php for ($i = 1; $i <= 5; $i++): ?>
                                    <option value="<?php echo $i; ?>" <?php echo $edit_review['rating'] == $i ? 'selected' : ''; ?>><?php echo $i; ?> звезд<?php echo $i == 1 ? 'а' : ($i < 5 ? 'ы' : ''); ?></option>
                                <?php endfor; ?>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="category">Категория</label>
                            <select id="category" name="category" class="form-control" required>
                                <option value="hotel" <?php echo $edit_review['category'] === 'hotel' ? 'selected' : ''; ?>>Гостиница</option>
                                <option value="sauna" <?php echo $edit_review['category'] === 'sauna' ? 'selected' : ''; ?>>Сауна</option>
                                <option value="restaurant" <?php echo $edit_review['category'] === 'restaurant' ? 'selected' : ''; ?>>Ресторан</option>
                                <option value="banquet" <?php echo $edit_review['category'] === 'banquet' ? 'selected' : ''; ?>>Банкетный зал</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="review_text">Текст отзыва</label>
                            <textarea id="review_text" name="review_text" class="form-control" required><?php echo htmlspecialchars($edit_review['review_text']); ?></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Сохранить изменения</button>
                            <a href="reviews.php?status=<?php echo $status_filter; ?>" class="btn btn-secondary">Отмена</a>
                        </div>
                    </form>
                </div>
            <?php endif; ?>
            
            <?php if (empty($reviews)): ?>
                <div class="alert alert-info">
                    Отзывы не найдены
                </div>
            <?php else: ?>
                <?php foreach ($reviews as $review): ?>
                    <div class="review-card">
                        <div class="review-header">
                            <div class="review-info">
                                <div class="review-name"><?php echo htmlspecialchars($review['name']); ?></div>
                                <div class="review-meta">
                                    <span class="review-date"><?php echo date('d.m.Y H:i', strtotime($review['created_at'])); ?></span>
                                    <span class="review-email"><?php echo htmlspecialchars($review['email']); ?></span>
                                    <span class="review-category"><?php echo ucfirst(htmlspecialchars($review['category'])); ?></span>
                                    <span class="status-badge status-<?php echo $review['status']; ?>">
                                        <?php 
                                            switch($review['status']) {
                                                case 'pending': echo 'На модерации'; break;
                                                case 'approved': echo 'Одобрен'; break;
                                                case 'rejected': echo 'Отклонен'; break;
                                            }
                                        ?>
                                    </span>
                                </div>
                            </div>
                            <div class="review-rating">
                                <?php for ($i = 1; $i <= 5; $i++): ?>
                                    <?php if ($i <= $review['rating']): ?>
                                        ★
                                    <?php else: ?>
                                        ☆
                                    <?php endif; ?>
                                <?php endfor; ?>
                            </div>
                        </div>
                        <div class="review-text">
                            <?php echo nl2br(htmlspecialchars($review['review_text'])); ?>
                        </div>
                        <div class="review-actions">
                            <?php if ($review['status'] === 'pending'): ?>
                                <form action="" method="post" style="display: inline;">
                                    <input type="hidden" name="action" value="approve">
                                    <input type="hidden" name="review_id" value="<?php echo $review['id']; ?>">
                                    <button type="submit" class="btn btn-success">Одобрить</button>
                                </form>
                                <form action="" method="post" style="display: inline;">
                                    <input type="hidden" name="action" value="reject">
                                    <input type="hidden" name="review_id" value="<?php echo $review['id']; ?>">
                                    <button type="submit" class="btn btn-danger">Отклонить</button>
                                </form>
                            <?php elseif ($review['status'] === 'approved'): ?>
                                <form action="" method="post" style="display: inline;">
                                    <input type="hidden" name="action" value="reject">
                                    <input type="hidden" name="review_id" value="<?php echo $review['id']; ?>">
                                    <button type="submit" class="btn btn-warning">Отозвать одобрение</button>
                                </form>
                            <?php elseif ($review['status'] === 'rejected'): ?>
                                <form action="" method="post" style="display: inline;">
                                    <input type="hidden" name="action" value="approve">
                                    <input type="hidden" name="review_id" value="<?php echo $review['id']; ?>">
                                    <button type="submit" class="btn btn-success">Одобрить</button>
                                </form>
                            <?php endif; ?>
                            <a href="reviews.php?edit=<?php echo $review['id']; ?>&status=<?php echo $status_filter; ?>" class="btn btn-primary">Редактировать</a>
                            <form action="" method="post" style="display: inline;" onsubmit="return confirm('Вы уверены, что хотите удалить этот отзыв?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="review_id" value="<?php echo $review['id']; ?>">
                                <button type="submit" class="btn btn-danger">Удалить</button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
                
                <div class="pagination">
                    <?php if ($page > 1): ?>
                        <a href="?page=1&status=<?php echo $status_filter; ?>">&laquo; Первая</a>
                        <a href="?page=<?php echo $page - 1; ?>&status=<?php echo $status_filter; ?>">&lsaquo; Предыдущая</a>
                    <?php else: ?>
                        <span class="disabled">&laquo; Первая</span>
                        <span class="disabled">&lsaquo; Предыдущая</span>
                    <?php endif; ?>
                    
                    <?php
                    $start_page = max(1, $page - 2);
                    $end_page = min($total_pages, $page + 2);
                    
                    for ($i = $start_page; $i <= $end_page; $i++):
                    ?>
                        <?php if ($i == $page): ?>
                            <span class="active"><?php echo $i; ?></span>
                        <?php else: ?>
                            <a href="?page=<?php echo $i; ?>&status=<?php echo $status_filter; ?>"><?php echo $i; ?></a>
                        <?php endif; ?>
                    <?php endfor; ?>
                    
                    <?php if ($page < $total_pages): ?>
                        <a href="?page=<?php echo $page + 1; ?>&status=<?php echo $status_filter; ?>">Следующая &rsaquo;</a>
                        <a href="?page=<?php echo $total_pages; ?>&status=<?php echo $status_filter; ?>">Последняя &raquo;</a>
                    <?php else: ?>
                        <span class="disabled">Следующая &rsaquo;</span>
                        <span class="disabled">Последняя &raquo;</span>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html> 