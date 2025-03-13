#!/usr/bin/env pwsh
# Универсальный скрипт управления проектом "Лесной дворик"

param (
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet("dev", "deploy", "init-db", "build", "clean")]
    [string]$Command
)

# Функция для проверки и создания .env файла
function Ensure-EnvFile {
    if (!(Test-Path -Path ".env")) {
        Write-Host "ПРЕДУПРЕЖДЕНИЕ: Файл .env отсутствует. Копируем из примера..." -ForegroundColor Yellow
        if (Test-Path -Path "config/.env.example") {
            Copy-Item -Path "config/.env.example" -Destination ".env"
            Write-Host "Скопирован config/.env.example в .env. Пожалуйста, отредактируйте файл .env с вашими настройками." -ForegroundColor Yellow
        } else {
            Write-Host "ОШИБКА: Файл config/.env.example не найден. Создайте файл .env вручную." -ForegroundColor Red
            Exit 1
        }
    }
}

# Функция для загрузки переменных окружения
function Load-EnvVars {
    $envContent = Get-Content -Path ".env" -ErrorAction SilentlyContinue
    foreach ($line in $envContent) {
        if ($line -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $key -Value $value -Scope Script
        }
    }
}

# Функция для проверки наличия Vercel CLI
function Ensure-VercelCLI {
    if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "ОШИБКА: CLI Vercel не установлен. Устанавливаем..." -ForegroundColor Red
        npm install -g vercel
    }
}

# Функция для копирования файлов в api/
function Copy-FilesToApi {
    Write-Host "Копируем файлы в директорию api/..." -ForegroundColor Green
    
    # Создаем директории, если они не существуют
    $directories = @("api", "api/public")
    foreach ($dir in $directories) {
        if (!(Test-Path -Path $dir)) {
            New-Item -Path $dir -ItemType Directory | Out-Null
        }
    }
    
    # Копируем директории из src/ в api/
    $sourceDirs = @("admin", "assets", "css", "js", "includes", "pages", "errors", "docs", "php")
    foreach ($dir in $sourceDirs) {
        if (Test-Path "src/$dir") {
            if (!(Test-Path -Path "api/$dir")) {
                New-Item -Path "api/$dir" -ItemType Directory | Out-Null
            }
            Copy-Item -Path "src/$dir/*" -Destination "api/$dir" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Копируем файлы из public/ в корень api/
    $rootFiles = @("sitemap.xml", "robots.txt")
    foreach ($file in $rootFiles) {
        if (Test-Path "public/$file") {
            Copy-Item -Path "public/$file" -Destination "api/" -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Копируем HTML файлы из public/ в api/public/
    $publicFiles = @("index.html", "404.html", "500.html")
    foreach ($file in $publicFiles) {
        if (Test-Path "public/$file") {
            Copy-Item -Path "public/$file" -Destination "api/public/" -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Копируем vercel.json в api/
    if (Test-Path "config/vercel/vercel.json") {
        Copy-Item -Path "config/vercel/vercel.json" -Destination "api/vercel.json" -Force -ErrorAction SilentlyContinue
    }
    
    # Создаем index.php в api/ если его нет
    if (-not (Test-Path "api/index.php")) {
        @"
<?php
// Определяем базовый путь
\$base_path = __DIR__;

// Получаем запрошенный URI
\$request_uri = \$_SERVER['REQUEST_URI'];

// Если запрос идет к index.html, просто включаем его
if (\$request_uri == '/' || \$request_uri == '/index.html') {
    include \$base_path . '/public/index.html';
    exit;
}

// Проверяем, существует ли запрошенный файл в public
\$public_path = \$base_path . '/public' . \$request_uri;
if (file_exists(\$public_path) && !is_dir(\$public_path)) {
    // Определяем MIME-тип на основе расширения файла
    \$extension = pathinfo(\$public_path, PATHINFO_EXTENSION);
    switch (\$extension) {
        case 'html': header('Content-Type: text/html'); break;
        case 'css': header('Content-Type: text/css'); break;
        case 'js': header('Content-Type: application/javascript'); break;
        case 'json': header('Content-Type: application/json'); break;
        case 'png': header('Content-Type: image/png'); break;
        case 'jpg': case 'jpeg': header('Content-Type: image/jpeg'); break;
        case 'gif': header('Content-Type: image/gif'); break;
        case 'svg': header('Content-Type: image/svg+xml'); break;
    }
    include \$public_path;
    exit;
}

// Проверяем, существует ли запрошенный файл в корне
\$file_path = \$base_path . \$request_uri;
if (file_exists(\$file_path) && !is_dir(\$file_path)) {
    // Определяем MIME-тип на основе расширения файла
    \$extension = pathinfo(\$file_path, PATHINFO_EXTENSION);
    switch (\$extension) {
        case 'html': header('Content-Type: text/html'); break;
        case 'css': header('Content-Type: text/css'); break;
        case 'js': header('Content-Type: application/javascript'); break;
        case 'json': header('Content-Type: application/json'); break;
        case 'png': header('Content-Type: image/png'); break;
        case 'jpg': case 'jpeg': header('Content-Type: image/jpeg'); break;
        case 'gif': header('Content-Type: image/gif'); break;
        case 'svg': header('Content-Type: image/svg+xml'); break;
    }
    include \$file_path;
    exit;
}

// Если файл не найден, перенаправляем на index.html
include \$base_path . '/public/index.html';
"@ | Out-File -FilePath "api/index.php" -Encoding UTF8
    }
    
    Write-Host "Файлы успешно скопированы в api/!" -ForegroundColor Green
}

# Функция для очистки директории api/
function Clean-ApiDirectory {
    Write-Host "Очищаем директорию api/..." -ForegroundColor Yellow
    
    $dirsToClean = @(
        "api/public", "api/admin", "api/includes", "api/assets", 
        "api/css", "api/js", "api/pages", "api/errors", 
        "api/docs", "api/data", "api/php"
    )
    
    foreach ($dir in $dirsToClean) {
        if (Test-Path $dir) {
            Remove-Item -Path "$dir/*" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "Директория api/ успешно очищена!" -ForegroundColor Green
}

# Функция для инициализации базы данных
function Initialize-Database {
    Write-Host "Инициализация базы данных для гостиницы 'Лесной дворик'..." -ForegroundColor Green
    
    # Проверяем наличие MySQL
    if (!(Get-Command mysql -ErrorAction SilentlyContinue)) {
        Write-Host "ОШИБКА: MySQL не установлен или не доступен в PATH." -ForegroundColor Red
        Write-Host "Пожалуйста, установите MySQL или добавьте его в PATH." -ForegroundColor Red
        Exit 1
    }
    
    # Загружаем переменные окружения
    Load-EnvVars
    
    # Создаем базу данных и применяем структуру
    Write-Host "Создаем базу данных $DB_NAME..." -ForegroundColor Cyan
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "База данных успешно создана или уже существует." -ForegroundColor Green
        
        # Применяем структуру базы данных
        Write-Host "Применяем структуру базы данных из файла config/db_structure.sql..." -ForegroundColor Cyan
        mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < config/db_structure.sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Структура базы данных успешно применена!" -ForegroundColor Green
        } else {
            Write-Host "ОШИБКА при применении структуры базы данных. Проверьте файл config/db_structure.sql." -ForegroundColor Red
        }
    } else {
        Write-Host "ОШИБКА при создании базы данных. Проверьте параметры подключения в файле .env." -ForegroundColor Red
    }
    
    Write-Host "Инициализация базы данных завершена." -ForegroundColor Green
}

# Функция для запуска локальной разработки
function Start-Development {
    Write-Host "Запуск локальной разработки для гостиницы 'Лесной дворик'..." -ForegroundColor Green
    
    # Проверяем наличие Vercel CLI
    Ensure-VercelCLI
    
    # Копируем файлы в api/
    Copy-FilesToApi
    
    # Запускаем локальный сервер разработки
    Write-Host "Запускаем локальный сервер разработки..." -ForegroundColor Green
    Write-Host "Сайт будет доступен по адресу: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Для остановки сервера нажмите Ctrl+C" -ForegroundColor Yellow
    
    vercel dev
}

# Функция для деплоя на Vercel
function Deploy-ToVercel {
    Write-Host "Начинаем деплой проекта на Vercel..." -ForegroundColor Green
    
    # Проверяем наличие Vercel CLI
    Ensure-VercelCLI
    
    # Проверяем, что vercel.json существует в config/vercel/
    if (!(Test-Path -Path "config/vercel/vercel.json")) {
        Write-Host "ОШИБКА: Файл vercel.json не найден в директории config/vercel/." -ForegroundColor Red
        Exit 1
    }
    
    # Копируем файлы в api/
    Copy-FilesToApi
    
    # Запускаем деплой
    Write-Host "Запускаем деплой на Vercel..." -ForegroundColor Green
    vercel --prod --confirm
    
    # Проверяем статус деплоя
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Деплой успешно завершен!" -ForegroundColor Green
        Write-Host "Ваш сайт доступен по адресу, указанному выше." -ForegroundColor Green
    } else {
        Write-Host "ОШИБКА при деплое на Vercel. Проверьте логи выше." -ForegroundColor Red
    }
}

# Основная логика скрипта
Ensure-EnvFile

switch ($Command) {
    "dev" {
        Start-Development
    }
    "deploy" {
        Deploy-ToVercel
    }
    "init-db" {
        Initialize-Database
    }
    "build" {
        Copy-FilesToApi
    }
    "clean" {
        Clean-ApiDirectory
    }
    default {
        Write-Host "Неизвестная команда: $Command" -ForegroundColor Red
        Write-Host "Доступные команды: dev, deploy, init-db, build, clean" -ForegroundColor Yellow
    }
} 