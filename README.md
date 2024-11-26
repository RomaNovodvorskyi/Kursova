<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login & Registration</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>  
<div class="wrap"> 
    <div class="wrap2">
    <div class="LogInBox">
        <p class="Logo">Log In</p>
        <br>
        <form id="loginForm">
            <div class="form-group">
                <label for="loginUsername">Username</label>
                <br>
                <input type="text" id="loginUsername" required>
            </div>
            <br>
            <div class="form-group">
                <label for="loginPassword">Password</label>
                <br>
                <input type="password" id="loginPassword" required>
            </div>
            <br>
            <br>
            <button type="submit">Login</button>
        </form>
    </div>

    <div class="SingUpBox">
        <p class="Logo">Sign Up</p>
        <br>
        <form id="registerForm">
            <div class="form-group">
                <label for="registerUsername">Username</label>
                <br>
                <input type="text" id="registerUsername" required>
            </div>
            <br>
            <div class="form-group">
                <label for="registerPassword">Password</label>
                <br>
                <input type="password" id="registerPassword" required>
            </div>
            <br>
            <br>
            <button type="submit">Register</button>
        </form>
    </div>
</div>
</div>

</body>
<script>
    // Логін
    document.getElementById('loginForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        // Перевірка, чи логін успішний
        if (data.success) {
            alert('Логін успішний!');
            // Збереження username в LocalStorage
            localStorage.setItem('username', username); // Замість user_id зберігаємо username
            // Перенаправлення на сторінку tasks.html
            window.location.href = 'tasks.html';
        } else {
            alert(data.message);
            console.log('Login failed:', data.message);
        }
    });

    // Реєстрація
    document.getElementById('registerForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            alert('Реєстрація успішна! Тепер ви можете увійти.');
        } else {
            alert(data.message);
        }
    });  


</script>

</html>
