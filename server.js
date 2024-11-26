const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');

// Ініціалізація Express
const app = express();
const port = 3000;

// Налаштування CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Змінити на вашу адресу
    credentials: true
}));

// Налаштування парсера тіла
app.use(bodyParser.json());

// Підключення до бази даних
const sequelize = new Sequelize('todo_db', 'root', 'romadb52', {
    host: 'localhost',
    dialect: 'mysql'
});

// Перевірка підключення до бази даних
sequelize.authenticate()
    .then(() => {
        console.log('Синхронізація з базою даних успішна');
    })
    .catch(err => {
        console.error('Неможливо підключитися до бази даних:', err);
    });

// Визначення моделей User, Task та Category
const User = sequelize.define('user', {
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    timestamps: false // вимикає createdAt і updatedAt
});

const Task = sequelize.define('task', {
    task_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    deadline: Sequelize.DATE,
    priority: Sequelize.ENUM('low', 'medium', 'high'),
    completed: Sequelize.TINYINT,
    username: Sequelize.STRING,
    category_name: Sequelize.STRING
}, {
    timestamps: false // вимикає createdAt і updatedAt
});

const Category = sequelize.define('category', {
    category_name: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    }
}, {
    timestamps: false // вимкнути автоматичне додавання createdAt і updatedAt
});

sequelize.sync()
    .then(() => console.log('Синхронізація з базою даних успішна'))
    .catch(error => console.error('Помилка синхронізації бази даних:', error));

// Роут для логіну
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        
        if (user) {
            if (user.password === password) {
                return res.json({ success: true, message: 'Логін успішний', username: user.username });
            } else {
                return res.json({ success: false, message: 'Неправильний пароль' });
            }
        } else {
            return res.json({ success: false, message: 'Користувача не знайдено' });
        }
    } catch (error) {
        console.error('Помилка під час логіну:', error.message, error.stack);
        return res.status(500).json({ success: false, message: 'Внутрішня помилка сервера' });
    }
});

// Роут для реєстрації
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        await User.create({ username, password });
        return res.json({ success: true, message: 'Реєстрація успішна' });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ success: false, message: 'Не вдалося зареєструвати користувача' });
    }
});

// Роут для додавання завдання
app.post('/addTask', async (req, res) => {
    const { username, title, description, deadline, priority, category_name } = req.body;

    try {
        // Перевіряємо, чи вже існує така категорія
        let category = await Category.findOne({ where: { category_name } });

        // Якщо такої категорії немає, додаємо її в таблицю `categories`
        if (!category) {
            category = await Category.create({ category_name });
        }

        // Додаємо завдання з вказаною категорією
        const newTask = await Task.create({
            username,
            title,
            description,
            deadline,
            priority,
            category_name: category.category_name
        });

        res.json({ success: true, taskId: newTask.task_id });
    } catch (error) {
        console.error('Error adding task:', error);
        res.json({ success: false, message: 'Сталася помилка при додаванні завдання.' });
    }
});

// Роут для отримання завдань користувача
// Роут для отримання завдань користувача з фільтрацією по категорії
app.get('/getTasks', async (req, res) => {
    const { username, category } = req.query;

    try {
        let whereCondition = { username };

        if (category && category !== 'all') {
            whereCondition.category_name = category; // Додаємо фільтрацію по категорії
        }

        // Отримуємо завдання з фільтрацією
        const tasks = await Task.findAll({ where: whereCondition });

        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.json({ success: false, message: 'Сталася помилка при отриманні завдань.' });
    }
});


// Роут для отримання категорій користувача
app.get('/getCategories', async (req, res) => {
    try {
        // Отримання всіх категорій без прив'язки до користувача
        const categories = await Category.findAll();
        res.json(categories); // Повертає JSON з усіма категоріями
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання категорій' });
    }
});

// Роут для отримання завдань користувача з фільтрацією по категорії
app.get('/getTasksByCategory', async (req, res) => {
    const { username, category } = req.query;

    try {
        let whereCondition = { username };

        if (category && category !== 'all') {
            whereCondition.category_name = category; // Додаємо фільтрацію по категорії
        }

        // Отримуємо завдання з фільтрацією
        const tasks = await Task.findAll({ where: whereCondition });

        res.json({ success: true, tasks });
    } catch (error) {
        console.error('Error fetching tasks by category:', error);
        res.json({ success: false, message: 'Сталася помилка при отриманні завдань.' });
    }
});


// Роут для видалення завдання за назвою
app.delete('/deleteTask', async (req, res) => {
    const { title } = req.body; // Очікуємо `title` у тілі запиту

    try {
        // Знаходимо завдання за назвою
        const task = await Task.findOne({ where: { title } });

        if (!task) {
            return res.json({ success: false, message: 'Завдання з такою назвою не знайдено.' });
        }

        // Видаляємо завдання
        await task.destroy();

        res.json({ success: true, message: 'Завдання видалено успішно.' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Сталася помилка при видаленні завдання.' });
    }
});


app.put('/markTaskAsCompleted', async (req, res) => {
    const { title } = req.body;

    try {
        const task = await Task.findOne({ where: { title } });

        if (!task) {
            return res.json({ success: false, message: 'Завдання з такою назвою не знайдено.' });
        }

        task.completed = 1; // Позначаємо як виконане
        await task.save();

        res.json({ success: true, message: 'Завдання позначено як виконане.' });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ success: false, message: 'Сталася помилка при оновленні завдання.' });
    }
});

  
// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});

