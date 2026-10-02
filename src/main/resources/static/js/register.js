const API_URL = 'http://localhost:8080/auth/register';

const loginForm = document.getElementById('registerForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username.trim() === "" || password.trim() === "") {
            alert("Παρακαλώ συμπληρώστε όλα τα πεδία!");
            return;
        }

        const newUser = {
            username: username,
            password: password
        };

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Σφάλμα εγγραφής! Μήπως το όνομα χρήστη υπάρχει ήδη;");
            }
            return response.text(); 
        })
        .then(data => {
            alert(data); 
            window.location.href = '/login.html';
        })
        .catch(error => {
            console.error("Σφάλμα:", error);
            alert(error.message);
        });
    });

