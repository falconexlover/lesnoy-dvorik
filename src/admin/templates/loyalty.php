<?php
// Проверка авторизации
if (!isAdminLoggedIn()) {
    header('Location: index.php');
    exit;
}

// Получаем уровни лояльности
$loyaltyLevels = getLoyaltyLevels($pdo);

// Получаем пользователей с их уровнями лояльности
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 10;
$offset = ($page - 1) * $limit;
$loyaltyUsers = getLoyaltyUsers($pdo, $limit, $offset);

// Обработка редактирования уровня лояльности
$editLevel = null;
if (isset($_GET['edit_level']) && (int)$_GET['edit_level'] > 0) {
    $levelId = (int)$_GET['edit_level'];
    foreach ($loyaltyLevels as $level) {
        if ($level['id'] == $levelId) {
            $editLevel = $level;
            break;
        }
    }
}
?>

<div class="content-wrapper">
    <div class="content-header">
        <h1>Программа лояльности</h1>
        <p>Управление уровнями лояльности и просмотр статистики пользователей</p>
    </div>
    
    <div class="content-body">
        <?php if (isset($message)): ?>
            <div class="alert alert-<?php echo $message_type; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3>Уровни лояльности</h3>
                        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#addLevelModal">
                            <i class="fa fa-plus"></i> Добавить уровень
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Название</th>
                                        <th>Мин. ночей</th>
                                        <th>Скидка (%)</th>
                                        <th>Описание</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($loyaltyLevels)): ?>
                                        <tr>
                                            <td colspan="5" class="text-center">Уровни лояльности не найдены. Добавьте первый уровень.</td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ($loyaltyLevels as $level): ?>
                                            <tr>
                                                <td><?php echo htmlspecialchars($level['name']); ?></td>
                                                <td><?php echo $level['min_nights']; ?></td>
                                                <td><?php echo $level['discount_percent']; ?>%</td>
                                                <td><?php echo htmlspecialchars($level['description']); ?></td>
                                                <td>
                                                    <a href="index.php?action=loyalty&edit_level=<?php echo $level['id']; ?>" class="btn btn-sm btn-primary">
                                                        <i class="fa fa-edit"></i> Редактировать
                                                    </a>
                                                    <a href="index.php?action=delete_loyalty_level&id=<?php echo $level['id']; ?>" 
                                                       class="btn btn-sm btn-danger" 
                                                       onclick="return confirm('Вы уверены, что хотите удалить этот уровень лояльности?');">
                                                        <i class="fa fa-trash"></i> Удалить
                                                    </a>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3>Пользователи программы лояльности</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Имя</th>
                                        <th>Email</th>
                                        <th>Телефон</th>
                                        <th>Бронирований</th>
                                        <th>Всего ночей</th>
                                        <th>Уровень лояльности</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($loyaltyUsers)): ?>
                                        <tr>
                                            <td colspan="7" class="text-center">Пользователи не найдены.</td>
                                        </tr>
                                    <?php else: ?>
                                        <?php foreach ($loyaltyUsers as $user): ?>
                                            <tr>
                                                <td><?php echo htmlspecialchars($user['name']); ?></td>
                                                <td><?php echo htmlspecialchars($user['email']); ?></td>
                                                <td><?php echo htmlspecialchars($user['phone']); ?></td>
                                                <td><?php echo $user['bookings_count']; ?></td>
                                                <td><?php echo $user['total_nights']; ?></td>
                                                <td>
                                                    <?php if ($user['loyalty_level']): ?>
                                                        <span class="badge badge-success"><?php echo htmlspecialchars($user['loyalty_level']); ?></span>
                                                    <?php else: ?>
                                                        <span class="badge badge-secondary">Нет</span>
                                                    <?php endif; ?>
                                                </td>
                                                <td>
                                                    <a href="index.php?action=view_user&id=<?php echo $user['id']; ?>" class="btn btn-sm btn-info">
                                                        <i class="fa fa-eye"></i> Просмотр
                                                    </a>
                                                    <a href="index.php?action=send_loyalty_email&id=<?php echo $user['id']; ?>" 
                                                       class="btn btn-sm btn-success" 
                                                       onclick="return confirm('Отправить пользователю информацию о программе лояльности?');">
                                                        <i class="fa fa-envelope"></i> Отправить письмо
                                                    </a>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Пагинация -->
                        <nav aria-label="Навигация по страницам" class="mt-4">
                            <ul class="pagination justify-content-center">
                                <?php if ($page > 1): ?>
                                    <li class="page-item">
                                        <a class="page-link" href="index.php?action=loyalty&page=<?php echo $page - 1; ?>">Предыдущая</a>
                                    </li>
                                <?php endif; ?>
                                
                                <li class="page-item active">
                                    <span class="page-link"><?php echo $page; ?></span>
                                </li>
                                
                                <li class="page-item">
                                    <a class="page-link" href="index.php?action=loyalty&page=<?php echo $page + 1; ?>">Следующая</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Модальное окно для добавления уровня лояльности -->
<div class="modal fade" id="addLevelModal" tabindex="-1" role="dialog" aria-labelledby="addLevelModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="addLevelModalLabel">Добавить уровень лояльности</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form action="index.php?action=add_loyalty_level" method="post">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="name">Название уровня:</label>
                        <input type="text" class="form-control" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="min_nights">Минимальное количество ночей:</label>
                        <input type="number" class="form-control" id="min_nights" name="min_nights" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="discount_percent">Процент скидки:</label>
                        <input type="number" class="form-control" id="discount_percent" name="discount_percent" min="0" max="100" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Описание:</label>
                        <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Отмена</button>
                    <button type="submit" class="btn btn-primary">Добавить</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Модальное окно для редактирования уровня лояльности -->
<?php if ($editLevel): ?>
<div class="modal fade" id="editLevelModal" tabindex="-1" role="dialog" aria-labelledby="editLevelModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editLevelModalLabel">Редактировать уровень лояльности</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form action="index.php?action=update_loyalty_level&id=<?php echo $editLevel['id']; ?>" method="post">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="edit_name">Название уровня:</label>
                        <input type="text" class="form-control" id="edit_name" name="name" value="<?php echo htmlspecialchars($editLevel['name']); ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_min_nights">Минимальное количество ночей:</label>
                        <input type="number" class="form-control" id="edit_min_nights" name="min_nights" min="1" value="<?php echo $editLevel['min_nights']; ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_discount_percent">Процент скидки:</label>
                        <input type="number" class="form-control" id="edit_discount_percent" name="discount_percent" min="0" max="100" value="<?php echo $editLevel['discount_percent']; ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_description">Описание:</label>
                        <textarea class="form-control" id="edit_description" name="description" rows="3"><?php echo htmlspecialchars($editLevel['description']); ?></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Отмена</button>
                    <button type="submit" class="btn btn-primary">Сохранить изменения</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    $(document).ready(function() {
        $('#editLevelModal').modal('show');
    });
</script>
<?php endif; ?> 