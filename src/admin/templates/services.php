<?php
// Проверка авторизации
if (!isAdminLoggedIn()) {
    header('Location: index.php');
    exit;
}

// Получаем список услуг
$services = getServices($pdo);

// Обработка редактирования услуги
$editService = null;
if (isset($_GET['edit']) && (int)$_GET['edit'] > 0) {
    $serviceId = (int)$_GET['edit'];
    $editService = getService($pdo, $serviceId);
}
?>

<div class="content-wrapper">
    <div class="content-header">
        <h1>Управление дополнительными услугами</h1>
        <p>Добавление, редактирование и удаление дополнительных услуг гостиницы</p>
    </div>
    
    <div class="content-body">
        <?php if (isset($message)): ?>
            <div class="alert alert-<?php echo $message_type; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        
        <div class="row mb-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3>Добавить новую услугу</h3>
                    </div>
                    <div class="card-body">
                        <form action="index.php?action=add_service" method="post" enctype="multipart/form-data">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="name">Название услуги:</label>
                                        <input type="text" class="form-control" id="name" name="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="price">Цена (₽):</label>
                                        <input type="number" class="form-control" id="price" name="price" min="0" step="0.01" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="sort_order">Порядок сортировки:</label>
                                        <input type="number" class="form-control" id="sort_order" name="sort_order" min="1" value="1">
                                    </div>
                                    <div class="form-group">
                                        <div class="custom-control custom-switch">
                                            <input type="checkbox" class="custom-control-input" id="is_active" name="is_active" value="1" checked>
                                            <label class="custom-control-label" for="is_active">Активна</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="description">Описание:</label>
                                        <textarea class="form-control" id="description" name="description" rows="5"></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="image">Изображение:</label>
                                        <input type="file" class="form-control-file" id="image" name="image">
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fa fa-plus"></i> Добавить услугу
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3>Список услуг</h3>
                    </div>
                    <div class="card-body">
                        <?php if (empty($services)): ?>
                            <div class="alert alert-info">
                                Услуги не найдены. Добавьте первую услугу с помощью формы выше.
                            </div>
                        <?php else: ?>
                            <div class="services-grid">
                                <?php foreach ($services as $service): ?>
                                    <div class="service-card <?php echo $service['is_active'] ? '' : 'inactive'; ?>">
                                        <div class="service-header">
                                            <h4><?php echo htmlspecialchars($service['name']); ?></h4>
                                            <div class="service-price"><?php echo number_format($service['price'], 0, '.', ' '); ?> ₽</div>
                                        </div>
                                        
                                        <?php if (!empty($service['image_path'])): ?>
                                            <div class="service-image">
                                                <img src="<?php echo htmlspecialchars($service['image_path']); ?>" alt="<?php echo htmlspecialchars($service['name']); ?>">
                                            </div>
                                        <?php endif; ?>
                                        
                                        <div class="service-description">
                                            <?php echo nl2br(htmlspecialchars($service['description'])); ?>
                                        </div>
                                        
                                        <div class="service-status">
                                            <?php if ($service['is_active']): ?>
                                                <span class="badge badge-success">Активна</span>
                                            <?php else: ?>
                                                <span class="badge badge-secondary">Неактивна</span>
                                            <?php endif; ?>
                                        </div>
                                        
                                        <div class="service-actions">
                                            <a href="index.php?action=services&edit=<?php echo $service['id']; ?>" class="btn btn-sm btn-primary">
                                                <i class="fa fa-edit"></i> Редактировать
                                            </a>
                                            <a href="index.php?action=delete_service&id=<?php echo $service['id']; ?>" 
                                               class="btn btn-sm btn-danger" 
                                               onclick="return confirm('Вы уверены, что хотите удалить эту услугу?');">
                                                <i class="fa fa-trash"></i> Удалить
                                            </a>
                                            
                                            <?php if ($service['is_active']): ?>
                                                <a href="index.php?action=toggle_service&id=<?php echo $service['id']; ?>&status=0" class="btn btn-sm btn-warning">
                                                    <i class="fa fa-eye-slash"></i> Деактивировать
                                                </a>
                                            <?php else: ?>
                                                <a href="index.php?action=toggle_service&id=<?php echo $service['id']; ?>&status=1" class="btn btn-sm btn-success">
                                                    <i class="fa fa-eye"></i> Активировать
                                                </a>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Модальное окно для редактирования услуги -->
<?php if ($editService): ?>
<div class="modal fade" id="editServiceModal" tabindex="-1" role="dialog" aria-labelledby="editServiceModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editServiceModalLabel">Редактировать услугу</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form action="index.php?action=update_service&id=<?php echo $editService['id']; ?>" method="post" enctype="multipart/form-data">
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="edit_name">Название услуги:</label>
                                <input type="text" class="form-control" id="edit_name" name="name" value="<?php echo htmlspecialchars($editService['name']); ?>" required>
                            </div>
                            <div class="form-group">
                                <label for="edit_price">Цена (₽):</label>
                                <input type="number" class="form-control" id="edit_price" name="price" min="0" step="0.01" value="<?php echo $editService['price']; ?>" required>
                            </div>
                            <div class="form-group">
                                <label for="edit_sort_order">Порядок сортировки:</label>
                                <input type="number" class="form-control" id="edit_sort_order" name="sort_order" min="1" value="<?php echo $editService['sort_order']; ?>">
                            </div>
                            <div class="form-group">
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" id="edit_is_active" name="is_active" value="1" <?php echo $editService['is_active'] ? 'checked' : ''; ?>>
                                    <label class="custom-control-label" for="edit_is_active">Активна</label>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="edit_description">Описание:</label>
                                <textarea class="form-control" id="edit_description" name="description" rows="5"><?php echo htmlspecialchars($editService['description']); ?></textarea>
                            </div>
                            <div class="form-group">
                                <label for="edit_image">Изображение:</label>
                                <?php if (!empty($editService['image_path'])): ?>
                                    <div class="current-image mb-2">
                                        <img src="<?php echo htmlspecialchars($editService['image_path']); ?>" alt="Текущее изображение" style="max-width: 200px;">
                                        <p class="text-muted">Текущее изображение</p>
                                    </div>
                                <?php endif; ?>
                                <input type="file" class="form-control-file" id="edit_image" name="image">
                                <input type="hidden" name="current_image" value="<?php echo htmlspecialchars($editService['image_path']); ?>">
                                <small class="form-text text-muted">Оставьте пустым, если не хотите менять изображение.</small>
                            </div>
                        </div>
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
        $('#editServiceModal').modal('show');
    });
</script>
<?php endif; ?>

<style>
.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.service-card {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.service-card.inactive {
    opacity: 0.7;
    background-color: #f8f9fa;
}

.service-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.service-header h4 {
    margin: 0;
    font-size: 18px;
}

.service-price {
    font-weight: bold;
    color: #28a745;
}

.service-image {
    margin-bottom: 10px;
    text-align: center;
}

.service-image img {
    max-width: 100%;
    max-height: 150px;
    object-fit: cover;
    border-radius: 4px;
}

.service-description {
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
}

.service-status {
    margin-bottom: 10px;
}

.service-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}
</style> 