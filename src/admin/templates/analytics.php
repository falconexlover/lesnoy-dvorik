<?php
// Проверка авторизации
if (!isAdminLoggedIn()) {
    header('Location: index.php');
    exit;
}

// Получаем период для статистики
$period = isset($_GET['period']) ? $_GET['period'] : 'month';
$validPeriods = ['day', 'month', 'year'];
if (!in_array($period, $validPeriods)) {
    $period = 'month';
}

// Получаем даты для фильтра занятости номеров
$today = date('Y-m-d');
$defaultStartDate = date('Y-m-d', strtotime('-30 days'));
$defaultEndDate = date('Y-m-d', strtotime('+30 days'));

$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : $defaultStartDate;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : $defaultEndDate;

// Получаем статистику бронирований
$bookingStats = getBookingStats($pdo, $period);

// Получаем статистику занятости номеров
$roomOccupancy = getRoomOccupancy($pdo, $startDate, $endDate);

// Подготовка данных для графиков
$periods = [];
$bookingCounts = [];
$revenues = [];
$avgNights = [];

foreach ($bookingStats as $stat) {
    $periods[] = $stat['period'];
    $bookingCounts[] = $stat['bookings_count'];
    $revenues[] = $stat['total_revenue'];
    $avgNights[] = $stat['avg_nights'];
}

// Переворачиваем массивы для хронологического порядка
$periods = array_reverse($periods);
$bookingCounts = array_reverse($bookingCounts);
$revenues = array_reverse($revenues);
$avgNights = array_reverse($avgNights);

// Подготовка данных для графика занятости номеров
$roomNames = [];
$occupancyRates = [];

foreach ($roomOccupancy as $room) {
    $roomNames[] = $room['room_name'];
    $occupancyRates[] = round($room['occupancy_percent'], 2);
}
?>

<div class="content-wrapper">
    <div class="content-header">
        <h1>Аналитика и статистика</h1>
        <p>Анализ бронирований и занятости номеров</p>
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
                        <h3>Статистика бронирований</h3>
                        <div class="period-selector">
                            <a href="index.php?action=analytics&period=day" class="btn btn-sm <?php echo $period === 'day' ? 'btn-primary' : 'btn-outline-primary'; ?>">По дням</a>
                            <a href="index.php?action=analytics&period=month" class="btn btn-sm <?php echo $period === 'month' ? 'btn-primary' : 'btn-outline-primary'; ?>">По месяцам</a>
                            <a href="index.php?action=analytics&period=year" class="btn btn-sm <?php echo $period === 'year' ? 'btn-primary' : 'btn-outline-primary'; ?>">По годам</a>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="stat-card">
                                    <div class="stat-card-header">
                                        <h4>Всего бронирований</h4>
                                    </div>
                                    <div class="stat-card-body">
                                        <div class="stat-value"><?php echo array_sum($bookingCounts); ?></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="stat-card">
                                    <div class="stat-card-header">
                                        <h4>Общая выручка</h4>
                                    </div>
                                    <div class="stat-card-body">
                                        <div class="stat-value"><?php echo number_format(array_sum($revenues), 0, '.', ' '); ?> ₽</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="stat-card">
                                    <div class="stat-card-header">
                                        <h4>Средняя продолжительность</h4>
                                    </div>
                                    <div class="stat-card-body">
                                        <div class="stat-value"><?php echo round(array_sum($avgNights) / count($avgNights), 1); ?> ночей</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <canvas id="bookingsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3>Занятость номеров</h3>
                        <form class="date-range-form">
                            <input type="hidden" name="action" value="analytics">
                            <div class="form-row">
                                <div class="col">
                                    <label for="start_date">С даты:</label>
                                    <input type="date" id="start_date" name="start_date" class="form-control" value="<?php echo $startDate; ?>">
                                </div>
                                <div class="col">
                                    <label for="end_date">По дату:</label>
                                    <input type="date" id="end_date" name="end_date" class="form-control" value="<?php echo $endDate; ?>">
                                </div>
                                <div class="col-auto align-self-end">
                                    <button type="submit" class="btn btn-primary">Применить</button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="occupancyChart"></canvas>
                        </div>
                        
                        <div class="table-responsive mt-4">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Номер</th>
                                        <th>Количество бронирований</th>
                                        <th>Забронировано ночей</th>
                                        <th>Процент занятости</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($roomOccupancy as $room): ?>
                                        <tr>
                                            <td><?php echo htmlspecialchars($room['room_name']); ?></td>
                                            <td><?php echo $room['bookings_count']; ?></td>
                                            <td><?php echo $room['booked_nights']; ?></td>
                                            <td>
                                                <div class="progress">
                                                    <div class="progress-bar" role="progressbar" style="width: <?php echo min(100, $room['occupancy_percent']); ?>%;" 
                                                         aria-valuenow="<?php echo round($room['occupancy_percent'], 2); ?>" aria-valuemin="0" aria-valuemax="100">
                                                        <?php echo round($room['occupancy_percent'], 2); ?>%
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // График бронирований
    const bookingsCtx = document.getElementById('bookingsChart').getContext('2d');
    const bookingsChart = new Chart(bookingsCtx, {
        type: 'bar',
        data: {
            labels: <?php echo json_encode($periods); ?>,
            datasets: [
                {
                    label: 'Количество бронирований',
                    data: <?php echo json_encode($bookingCounts); ?>,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Выручка (₽)',
                    data: <?php echo json_encode($revenues); ?>,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Количество бронирований'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Выручка (₽)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
    
    // График занятости номеров
    const occupancyCtx = document.getElementById('occupancyChart').getContext('2d');
    const occupancyChart = new Chart(occupancyCtx, {
        type: 'bar',
        data: {
            labels: <?php echo json_encode($roomNames); ?>,
            datasets: [{
                label: 'Процент занятости',
                data: <?php echo json_encode($occupancyRates); ?>,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Процент занятости'
                    }
                }
            }
        }
    });
});
</script> 