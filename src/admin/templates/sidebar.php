<div class="sidebar">
    <div class="sidebar-header">
        <img src="../assets/images/logo.png" alt="Лесной дворик">
        <h2>Панель управления</h2>
    </div>
    
    <ul class="sidebar-menu">
        <li class="<?php echo ($action === 'list' || $action === 'view') ? 'active' : ''; ?>">
            <a href="index.php?action=list">
                <i class="fa fa-calendar"></i> Бронирования
            </a>
        </li>
        <li class="<?php echo ($action === 'stats' || $action === 'analytics') ? 'active' : ''; ?>">
            <a href="index.php?action=analytics">
                <i class="fa fa-chart-bar"></i> Аналитика
            </a>
        </li>
        <li class="<?php echo ($action === 'rooms') ? 'active' : ''; ?>">
            <a href="index.php?action=rooms">
                <i class="fa fa-bed"></i> Управление номерами
            </a>
        </li>
        <li class="<?php echo ($action === 'services') ? 'active' : ''; ?>">
            <a href="index.php?action=services">
                <i class="fa fa-concierge-bell"></i> Доп. услуги
            </a>
        </li>
        <li class="<?php echo ($action === 'loyalty') ? 'active' : ''; ?>">
            <a href="index.php?action=loyalty">
                <i class="fa fa-award"></i> Программа лояльности
            </a>
        </li>
        
        <!-- Пункты меню для CMS -->
        <li class="<?php echo ($action === 'content') ? 'active' : ''; ?>">
            <a href="index.php?action=content">
                <i class="fa fa-file-alt"></i> Управление контентом
            </a>
        </li>
        <li class="<?php echo ($action === 'reviews') ? 'active' : ''; ?>">
            <a href="index.php?action=reviews">
                <i class="fa fa-comments"></i> Отзывы
            </a>
        </li>
        <li class="<?php echo ($action === 'metasearch') ? 'active' : ''; ?>">
            <a href="index.php?action=metasearch">
                <i class="fa fa-search"></i> Метапоисковики
            </a>
        </li>
        <li class="<?php echo ($action === 'settings') ? 'active' : ''; ?>">
            <a href="index.php?action=settings">
                <i class="fa fa-cog"></i> Настройки сайта
            </a>
        </li>
        <li class="<?php echo ($action === 'generate') ? 'active' : ''; ?>">
            <a href="index.php?action=generate">
                <i class="fa fa-sync"></i> Генерация сайта
            </a>
        </li>
        
        <li>
            <a href="index.php?action=logout" class="logout">
                <i class="fa fa-sign-out-alt"></i> Выход
            </a>
        </li>
    </ul>
</div> 