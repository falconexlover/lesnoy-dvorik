# Гостиница "Лесной дворик" - Веб-сайт

Современный веб-сайт для гостиницы "Лесной дворик" с адаптивным дизайном, оптимизированной производительностью и удобным интерфейсом бронирования.

## 🌟 Особенности

- **Адаптивный дизайн** — оптимизирован для всех устройств
- **Высокая производительность** — оптимизированная загрузка ресурсов
- **Оптимизация изображений** — WebP, адаптивные размеры, ленивая загрузка
- **Современный UI/UX** — анимации при скролле, интерактивные элементы
- **Доступность** — соответствие WCAG 2.1, ARIA-атрибуты
- **Система бронирования** — форма с валидацией и интеграцией с БД
- **Административная панель** — управление номерами, бронированиями и контентом
- **Интерактивная карта** — с отметкой местоположения гостиницы
- **SEO-оптимизация** — структурированные данные, мета-теги

## 🛠️ Технологии

- **Frontend**: HTML5, CSS3 (переменные, гриды, флексбоксы), JavaScript (ES6+)
- **Backend**: PHP 8.1
- **Хостинг**: Vercel с поддержкой PHP
- **Оптимизация**: Sharp для обработки изображений
- **Инструменты**: PowerShell для автоматизации задач

## 📁 Структура проекта

```
/
├── api/                  # Директория с файлами проекта для Vercel (генерируется автоматически)
├── config/               # Конфигурационные файлы
│   ├── .env.example      # Пример файла окружения
│   ├── db_structure.sql  # Структура базы данных
│   ├── npm/              # Конфигурация NPM
│   └── vercel/           # Конфигурация Vercel
├── public/               # Публичные файлы
│   ├── index.html        # Главная страница
│   ├── css/              # Стили CSS
│   ├── js/               # JavaScript файлы
│   ├── images/           # Изображения
│   └── fonts/            # Шрифты
├── scripts/              # Скрипты для управления проектом
│   ├── hotel.ps1         # Универсальный скрипт управления
│   └── optimize-images.js # Скрипт оптимизации изображений
├── src/                  # Исходные файлы для разработки
│   ├── admin/            # Административная панель
│   ├── assets/           # Ресурсы (изображения, шрифты)
│   ├── css/              # Стили CSS
│   ├── js/               # JavaScript файлы
│   ├── includes/         # Включаемые файлы PHP
│   └── php/              # PHP скрипты
├── .env                  # Файл окружения (создается из .env.example)
├── .gitignore            # Файлы, исключенные из Git
├── package.json          # Символическая ссылка на config/npm/package.json
└── vercel.json           # Символическая ссылка на config/vercel/vercel.json
```

## 🔐 Доступ к административной панели

Для доступа к административной панели перейдите по адресу:
```
https://ваш-домен/admin/
```

**Важно:** После первого входа обязательно измените логин и пароль в административной панели.

## 💻 Локальная разработка

### Предварительные требования

- Node.js 16.x или выше
- PHP 8.1 или выше
- PowerShell 7.0 или выше
- MySQL/MariaDB

### Установка и запуск

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/username/lesnoy-dvorik.git
   cd lesnoy-dvorik
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   ```

3. **Настройка окружения**
   ```bash
   cp config/.env.example .env
   # Отредактируйте .env файл с вашими настройками
   ```

4. **Инициализация базы данных**
   ```bash
   npm run init-db
   ```

5. **Запуск локального сервера**
   ```bash
   npm run dev
   ```

Сайт будет доступен по адресу: http://localhost:3000

## 🚀 Деплой на Vercel

1. **Установка Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Авторизация в Vercel**
   ```bash
   vercel login
   ```

3. **Деплой проекта**
   ```bash
   npm run deploy
   ```

### Настройка переменных окружения

После первого деплоя настройте переменные окружения в панели управления Vercel:

1. Перейдите на сайт [Vercel](https://vercel.com)
2. Выберите ваш проект
3. Перейдите в раздел "Settings" -> "Environment Variables"
4. Добавьте необходимые переменные из вашего .env файла

## 📊 Структура базы данных

База данных содержит следующие основные таблицы:

- **bookings** — бронирования номеров
- **users** — администраторы системы
- **rooms** — информация о номерах
- **reviews** — отзывы клиентов
- **content** — контент сайта
- **settings** — настройки сайта

Полная структура доступна в файле `config/db_structure.sql`.

## 🔧 Команды управления проектом

Проект управляется через единый скрипт `scripts/hotel.ps1`:

- `npm run dev` — запуск локального сервера разработки
- `npm run build` — сборка проекта
- `npm run deploy` — деплой на Vercel
- `npm run init-db` — инициализация базы данных
- `npm run clean` — очистка директории api/
- `npm run optimize-images` — оптимизация изображений
- `npm run lint` — проверка JavaScript кода

## 🔍 Оптимизация проекта

### JavaScript-оптимизация
- Объединены дублирующиеся функции в единый файл main.js
- Добавлена поддержка доступности (ARIA-атрибуты)
- Реализована ленивая загрузка изображений и лайтбокс для галереи

### CSS-оптимизация
- Создана единая система CSS-переменных
- Оптимизированы стили, удалены дубликаты
- Улучшена адаптивность и добавлены анимации

### Оптимизация изображений
- Автоматическая конвертация в WebP
- Создание адаптивных версий разных размеров
- Оптимизация качества и размера

## 📝 Контакты и поддержка

По всем вопросам обращайтесь к администратору проекта.

## 📄 Лицензия

MIT 