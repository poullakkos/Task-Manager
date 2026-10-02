const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('id');
console.log("Το ID του task που πατήθηκε είναι:", taskId);

const API_URL = 'http://localhost:8080/tasks';
const API_CATEGORIES_URL = 'http://localhost:8080/categories';

const token = localStorage.getItem('jwt');

// 2. Αν δεν υπάρχει Token, τον διώχνουμε στο login
if (!token) {
    window.location.href = '/login.html';
}
let isEditing = false;
let currentTask = null;
let categories = [];

function fetchCategories() {
    fetch(API_CATEGORIES_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(response => response.json())
        .then(data => {
            categories = data;
        })
        .catch(error => console.error('Σφάλμα φόρτωσης κατηγοριών:', error));
}

function fetchTaskDetails(taskId) {
    fetch(`${API_URL}/${taskId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(response => response.json())
        .then(task => {
            currentTask = task;
            const categoryName = currentTask.category ? currentTask.category.name : '-';
            const detailsList = document.querySelector('.details');
            detailsList.innerHTML = `
                <li>
                    <label for="title">Τίτλος:</label>
                    <div id="title">${task.title}</div>
                </li>
                <li>
                    <label for="description">Περιγραφή:</label>
                    <div id="description">${task.description}</div>
                </li>
                <li>
                    <label for="category">Κατηγορία:</label>
                    <div id="categoryView">${categoryName}</div>
                </li>
                <li>
                    <label for="dueDate">Ημερομηνία Λήξης:</label>
                    <div id="dueDate">${task.dueDate}</div>
                </li>
                <li>
                    <label for="status">Κατάσταση:</label>
                    <div id="status">${task.completed ? 'Ολοκληρωμένη' : 'Μη Ολοκληρωμένη'}</div>
                </li>
            `;
        });
}

function editTask() {
    isEditing =!isEditing;

    const detailsList = document.querySelector('.details');
    const editButton = document.querySelector('.header');
    if (isEditing) {

        let optionsHtml = '<option value="">(Χωρίς Κατηγορία)</option>';
        categories.forEach(cat => {
            // Αν το task έχει ήδη αυτή την κατηγορία, τη μαρκάρουμε ως "selected"
            const isSelected = (currentTask.category && currentTask.category.id === cat.id) ? 'selected' : '';
            optionsHtml += `<option value="${cat.id}" ${isSelected}>${cat.name}</option>`;
        });

        optionsHtml += '<option value="new" style="font-weight: bold; color: #28a745;">+ Δημιουργία Νέας...</option>';
        // --- ΛΕΙΤΟΥΡΓΙΑ ΕΠΕΞΕΡΓΑΣΙΑΣ (Inputs) ---
        detailsList.innerHTML = `
            <li>
                <label for="editTitle">Τίτλος:</label>
                <input type="text" id="editTitle" value="${currentTask.title}">
            </li>
            <li>
                <label for="editDescription">Περιγραφή:</label>
                <input type="text" id="editDescription" value="${currentTask.description || ''}">
            </li>
            <li>
                <label for="editCategory">Κατηγορία:</label>
                <select id="editCategory" onchange="handleEditCategoryChange(this)">
                    ${optionsHtml}
                </select>
                <div id="newCategoryContainer" style="display: none; flex: 1; gap: 5px; margin-top: 10px;">
                    <input type="text" id="newCategoryName" placeholder="Όνομα νέας κατηγορίας...">
                    <button type="button" class="add-btn" onclick="saveNewCategory()">✓</button>
                    <button type="button" class="delete-btn" onclick="cancelNewCategory()">✗</button>
                </div>
            </li>
            <li>
                <label for="editDueDate">Ημερομηνία Λήξης:</label>
                <input type="date" id="editDueDate" value="${currentTask.dueDate || ''}">
            </li>
            <li>
                <label for="editStatus">Κατάσταση:</label>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="editStatus" ${currentTask.completed ? 'checked' : ''}>
                    <span>Ολοκληρωμένη</span>
                </div>
            </li>
        `;
        editButton.innerHTML = `
            <h1>Επεξεργασία Εργασίας</h1>
            <div>
                <button class="edit-btn" onclick="saveTask()">Αποθήκευση</button>
                <button class="edit-btn" onclick="editTask()">Ακύρωση</button>
            </div>
        `;
    } else {
        const categoryName = currentTask.category ? currentTask.category.name : '-';
        detailsList.innerHTML = `
            <li>
                <label for="title">Τίτλος:</label>
                <div id="title">${currentTask.title}</div>
            </li>
            <li>
                <label for="description">Περιγραφή:</label>
                <div id="description">${currentTask.description || '-'}</div>
            </li>
            <li>
                <label for="category">Κατηγορία:</label>
                <div id="categoryView">${categoryName}</div>
            </li>
            <li>
                <label for="dueDate">Ημερομηνία Λήξης:</label>
                <div id="dueDate">${currentTask.dueDate || '-'}</div>
            </li>
            <li>
                <label for="status">Κατάσταση:</label>
                <div id="status">${currentTask.completed ? 'Ολοκληρωμένη' : 'Μη Ολοκληρωμένη'}</div>
            </li>
        `;
        editButton.innerHTML = `
            <h1>Επεξεργασία Εργασίας</h1>
            <div>
                <button class="edit-btn" onclick="editTask()">Edit</button>
                <button class="edit-btn" onclick="deleteCurrentTask()">Διαγραφή</button>
            </div>
        `;
    }
}

function saveTask() {
    const updatedTitle = document.getElementById('editTitle').value;
    const updatedDescription = document.getElementById('editDescription').value;
    const updatedDueDate = document.getElementById('editDueDate').value;
    const updatedStatus = document.getElementById('editStatus').checked;

    const updatedCategoryId = document.getElementById('editCategory').value;

    // --- ΤΟ ΦΡΕΝΟ ΠΟΥ ΕΛΕΙΠΕ ---
    if (updatedCategoryId === "new") {
        alert("Παρακαλώ αποθηκεύστε πρώτα τη νέα κατηγορία (πατώντας το ✓) ή ακυρώστε την (πατώντας το ✗).");
        return; // Σταματάει η αποθήκευση!
    }

    const updatedTask = {
        title: updatedTitle,
        description: updatedDescription,
        dueDate: updatedDueDate,
        completed: updatedStatus,
        category: updatedCategoryId ? { id: updatedCategoryId } : null
    };

    fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify(updatedTask)
    })
    .then(response => response.json())
    .then(savedTask => {
    
        if (savedTask.category && savedTask.category.id) {
            const matchedCategory = categories.find(c => c.id == savedTask.category.id);
            if (matchedCategory) {
                savedTask.category.name = matchedCategory.name;
            }
        }
        
        currentTask = savedTask; // Αποθηκεύουμε τα νέα, διορθωμένα δεδομένα
        editTask(); // Γυρνάμε τη σελίδα σε View Mode (διορθώνοντας ΚΑΙ τα κουμπιά)
    })
    .catch(error => console.error("Σφάλμα:", error));
}

function deleteCurrentTask() {
    // 1. Εμφανίζουμε προειδοποιητικό μήνυμα
    const isConfirmed = confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την εργασία;");
    
    // 2. Αν πατήσει "Ακύρωση", η συνάρτηση σταματάει εδώ
    if (!isConfirmed) {
        return; 
    }

    // 3. Στέλνουμε το DELETE Request στο Spring Boot
    fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(response => {
        if (response.ok) {
            // Μόλις διαγραφεί επιτυχώς, γυρνάμε αυτόματα στην αρχική σελίδα!
            window.location.href = 'tasks.html';
        } else {
            alert("Υπήρξε πρόβλημα κατά τη διαγραφή.");
        }
    })
    .catch(error => console.error("Σφάλμα:", error));
}

function handleEditCategoryChange(selectElement) {
    if (selectElement.value === 'new') {
        selectElement.style.display = 'none';
        document.getElementById('newCategoryContainer').style.display = 'flex';
        document.getElementById('newCategoryName').focus();
    }
}

function cancelNewCategory() {
    document.getElementById('newCategoryContainer').style.display = 'none';
    const select = document.getElementById('editCategory');
    select.style.display = 'block';
    
    // Το επιστρέφουμε σε αυτό που είχε πριν
    select.value = currentTask.category ? currentTask.category.id : '';
    document.getElementById('newCategoryName').value = '';
}

function saveNewCategory() {
    const inputField = document.getElementById('newCategoryName');
    const newCategory = inputField.value.trim();
    if (newCategory === "") return;

    fetch(API_CATEGORIES_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ name: newCategory })
    })
    .then(response => response.json())
    .then(savedCategory => {
        document.getElementById('newCategoryContainer').style.display = 'none';
        const select = document.getElementById('editCategory');
        select.style.display = 'block';
        inputField.value = '';
        
        // Ανανεώνουμε μόνο το Dropdown 
        refreshDropdownOnly(savedCategory.id);
    })
    .catch(error => console.error("Σφάλμα:", error));
}

// Βοηθητική συνάρτηση: Ανανεώνει τις επιλογές χωρίς να "χαλάει" την υπόλοιπη φόρμα
function refreshDropdownOnly(idToSelect = null) {
    fetch(API_CATEGORIES_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(res => res.json())
        .then(data => {
            categories = data;
            const select = document.getElementById('editCategory');
            if (!select) return; 

            const currentValue = idToSelect || select.value; 
            
            let optionsHtml = '<option value="">(Χωρίς Κατηγορία)</option>';
            categories.forEach(cat => {
                optionsHtml += `<option value="${cat.id}">${cat.name}</option>`;
            });
            optionsHtml += '<option value="new" style="font-weight: bold; color: #28a745;">+ Δημιουργία Νέας...</option>';
            
            select.innerHTML = optionsHtml;
            
            if (data.some(c => c.id == currentValue)) {
                select.value = currentValue;
            } else {
                select.value = ''; 
            }
        });
}

fetchCategories();
fetchTaskDetails(taskId);