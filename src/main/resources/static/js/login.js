const API_URL = 'http://localhost:8080/auth/login';

const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username.trim() === "" || password.trim() === "") {
            alert("Παρακαλώ συμπληρώστε όλα τα πεδία!");
            return;
        }

        const user = {
            username: username,
            password: password
        };

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Λάθος όνομα χρήστη ή κωδικός!");
            }
            return response.text(); 
        })
        .then(token => {
            localStorage.setItem('jwt', token);
            window.location.href = '/tasks.html';
        })
        .catch(error => {
            console.error("Σφάλμα:", error);
            alert(error.message);
        });
    });

