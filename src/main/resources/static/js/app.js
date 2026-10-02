const API_URL = 'http://localhost:8080/tasks';
const API_CATEGORIES_URL = 'http://localhost:8080/categories';
const API_STATS_URL = 'http://localhost:8080/tasks/stats';

const token = localStorage.getItem('jwt');

if (!token) {
    window.location.href = '/login.html';
}
let selectedDate = null;
let allTasks = []; // ΝΕΟ: Κρατάμε εδώ όλες τις εργασίες για να τις βλέπει το ημερολόγιο

// --- ΛΕΙΤΟΥΡΓΙΕΣ API ---
window.addEventListener('pageshow', function(event) {
    // Το event.persisted είναι true αν η σελίδα φορτώθηκε από την "παγωμένη" μνήμη του browser (bfcache)
    if (event.persisted) {
        fetchTasks(); // Ξαναζητάμε τα δεδομένα από το Spring Boot για να είναι φρέσκα!
    }
});

function fetchStats() {
    fetch(API_STATS_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(response => response.json())
        .then(data => {
            // Το 'data' είναι το DTO μας! Παίρνουμε τις τιμές και τις βάζουμε στα σωστά IDs του HTML:
            document.getElementById('stat-total').textContent = data.tasks;
            document.getElementById('stat-completed').textContent = data.completed;
            document.getElementById('stat-notCompleted').textContent = data.notCompleted;
            document.getElementById('stat-expired').textContent = data.expired;
        })
        .catch(error => console.error('Σφάλμα κατά τη φόρτωση των στατιστικών:', error));
}

function fetchTasks() {
    fetch(API_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(response => response.json())
        .then(tasks => {
            allTasks = tasks; // Αποθήκευση στο global array
            
            const taskList = document.getElementById('taskList');

            taskList.innerHTML = '';

            tasks.forEach(task => {
                const categoryBadge = task.category ? `<span class="category-badge">${task.category.name}</span>` : '';
                taskList.innerHTML += `
                    <li>
                        <a href="edit-task.html?id=${task.id}" style="display: flex; flex-direction: column; gap: 5px; flex: 1; text-decoration: none; color: inherit;">
                            <div>
                                ${task.title} 
                                <span style="color:#888; font-size: 0.9em;">
                                    ${task.dueDate ? '(' + task.dueDate + ')' : ''}
                                </span>
                                ${categoryBadge}
                            </div>
                            <span style="color:#888; font-size: 0.9em;">
                                ${task.completed ? '(Ολοκληρωμένη)' : '(Μη Ολοκληρωμένη)'}
                            </span>
                        </a>
                        
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Διαγραφή</button>
                    </li>
                `;
            });

            // Ενημερώνουμε το ημερολόγιο για να δείξει τις "κουκκίδες" των εργασιών
            if (typeof renderDays === 'function') renderDays();
        })
        .catch(error => console.error('Σφάλμα:', error));
}

function fetchCategories() {
    fetch(API_CATEGORIES_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('taskCategory');
            let optionsHtml = '<option value="">(Χωρίς Κατηγορία)</option>';
            categories.forEach(category => {
                optionsHtml += `<option value="${category.id}">${category.name}</option>`;
            });
            optionsHtml += '<option value="new" style="font-weight: bold; color: #28a745;">+ Δημιουργία Νέας...</option>';
            categorySelect.innerHTML = optionsHtml;
        })
        .catch(error => console.error('Σφάλμα:', error));
}

document.getElementById('taskCategory').addEventListener('change', function() {
    if (this.value === 'new') {
        this.style.display = 'none'; // Κρύβουμε το select
        document.getElementById('newCategoryContainer').style.display = 'flex'; // Εμφανίζουμε το input
        document.getElementById('newCategoryName').focus(); // Βάζουμε τον κέρσορα μέσα
    }
});

function openCategoryModal() {
    document.getElementById('categoryModal').style.display = 'flex';
    populateCategoryModal(); // Γεμίζει τη λίστα κάθε φορά που το ανοίγεις
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

// 2. Λήψη κατηγοριών και εμφάνιση μέσα στο Modal
function populateCategoryModal() {
    const list = document.getElementById('modalCategoryList');
    list.innerHTML = '<li>Φόρτωση...</li>';

    fetch(API_CATEGORIES_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(response => response.json())
        .then(data => {
            list.innerHTML = '';
            
            if (data.length === 0) {
                list.innerHTML = '<li>Δεν υπάρχουν κατηγορίες.</li>';
                return;
            }
            
            // Φτιάχνουμε ένα <li> για κάθε κατηγορία με τον δικό της κάδο
            data.forEach(cat => {
                list.innerHTML += `
                    <li>
                        <span>${cat.name}</span>
                        <button type="button" class="delete-btn" style="padding: 6px 10px;" onclick="deleteCategoryFromModal(${cat.id})" title="Διαγραφή">🗑️</button>
                    </li>
                `;
            });
        })
        .catch(error => console.error('Σφάλμα:', error));
}

// 3. Η νέα συνάρτηση διαγραφής (από το Modal)
function deleteCategoryFromModal(categoryId) {
    const isConfirmed = confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την κατηγορία;");
    if (!isConfirmed) return;

    fetch(`${API_CATEGORIES_URL}/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(response => {
        if (response.ok) {
            // Ανανεώνουμε αμέσως τη λίστα στο Modal και στο κεντρικό Dropdown
            populateCategoryModal(); 
            fetchCategories(); 
            fetchTasks();
        } else {
            alert("Δεν μπορεί να διαγραφεί! Βεβαιωθείτε ότι δεν υπάρχουν εργασίες που ανήκουν σε αυτή την κατηγορία.");
        }
    })
    .catch(error => console.error("Σφάλμα:", error));
}

function cancelNewCategory() {
    document.getElementById('newCategoryContainer').style.display = 'none';
    const select = document.getElementById('taskCategory');
    select.style.display = 'block';
    select.value = ''; // Το γυρνάμε στην προεπιλογή (Χωρίς Κατηγορία)
    document.getElementById('newCategoryName').value = ''; // Καθαρίζουμε το input
}

function saveNewCategory() {
    const newCategoryInput = document.getElementById('newCategoryName')
    const newCategory = newCategoryInput.value.trim();
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
        const select = document.getElementById('taskCategory');
        select.style.display = 'block';
        newCategoryInput.value = ''; 
        
        fetchCategories();
        setTimeout(() => {
                select.value = savedCategory.id;
            }, 200);
        })
        .catch(error => console.error("Σφάλμα:", error));
}



function addTask() {
    const input = document.getElementById('taskTitle');
    const newTitle = input.value;
    const catInput = document.getElementById('taskCategory')
    const categoryId = catInput.value;

    if (newTitle.trim() === "") return;

    let formattedDueDate = null;
    if (selectedDate) {
        formattedDueDate = formatDateISO(selectedDate);
    }

    const newTask = {
        title: newTitle,
        description: "",
        completed: false,
        dueDate: formattedDueDate,
        category: categoryId ? { id: categoryId } : null
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify(newTask)
    })
    .then(response => response.json())
    .then(() => {
        input.value = '';
        catInput.value = '';
        fetchTasks(); 
        fetchStats();
    })
    .catch(error => console.error('Σφάλμα:', error));
}

function deleteTask(taskId) {
    fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(() => {
        fetchTasks();
        fetchStats();
    })
    .catch(error => console.error('Σφάλμα:', error));
}

function formatDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// --- ΗΜΕΡΟΛΟΓΙΟ ---

let renderDays; // Την κάνουμε global για να την καλεί το fetchTasks

document.addEventListener('DOMContentLoaded', function () {
    const monthYear = document.getElementById('month-year');
    const daysContainer = document.getElementById('days');
    const weekdaysContainer = document.querySelector('.weekdays'); 
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let currentDate = new Date();
    let today = new Date();
    let currentView = 'days'; 

    renderDays = function() {
        currentView = 'days';
        daysContainer.className = 'days'; 
        weekdaysContainer.style.display = 'flex'; 
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay = new Date(year, month + 1, 0).getDate();
        
        monthYear.textContent = `${months[month]} ${year}`;
        daysContainer.innerHTML = '';
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDay; i > 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = prevMonthLastDay - i + 1;
            dayDiv.classList.add('fade');
            daysContainer.appendChild(dayDiv);
        }
        
        for (let i = 1; i <= lastDay; i++) {
            const dayDiv = document.createElement('div');
            
            // Ελέγχουμε αν υπάρχει εργασία για αυτή τη μέρα
            const checkIsoDate = formatDateISO(new Date(year, month, i));
            const dayTasks = allTasks.filter(task => task.dueDate === checkIsoDate);

                if (dayTasks.length > 0) {
                    // Παίρνουμε τους τίτλους και τους ενώνουμε (αν είναι πάνω από ένας)
                    const tasksHtml = dayTasks.map(task => `
                        <span style="display: flex; align-items: center; gap: 5px; font-size: 12px; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">
                            <span style="min-width: 6px; height: 6px; background: orangered; border-radius: 50%; display: inline-block;"></span>
                            <span style="overflow: hidden; text-overflow: ellipsis;">${task.title}</span>
                        </span>
                    `).join('');
                    
                    // Εμφανίζουμε τον αριθμό και από κάτω τη λίστα με τα bullets
                    // Χρησιμοποιούμε flex-direction: column για να μπαίνουν η μία κάτω από την άλλη
                    dayDiv.innerHTML = `${i} 
                    <span style="display: flex; flex-direction: column; gap: 3px; margin-top: 5px; width: 90%; overflow: hidden; align-items: flex-start;">
                        ${tasksHtml}
                    </span>`;

                } else {
                    dayDiv.innerHTML = `${i}`;
                }
            
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }
            if (selectedDate && i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                dayDiv.classList.add('selected');
            }

            dayDiv.addEventListener('click', function (e) {
                e.stopPropagation(); 
                
                const allDays = daysContainer.querySelectorAll('div');
                allDays.forEach(d => d.classList.remove('selected'));
                dayDiv.classList.add('selected');
                
                selectedDate = new Date(year, month, i);
                
                // Ενημέρωση της ετικέτας δεξιά για να ξέρει ο χρήστης τι επέλεξε
                const label = document.getElementById('selectedDateLabel');
                if (label) label.textContent = "Επιλεγμένη: " + selectedDate.toLocaleDateString('el-GR');
            });

            daysContainer.appendChild(dayDiv);
        }
        
        const nextMonthStartDay = 7 - new Date(year, month + 1, 0).getDay() - 1;
        for (let i = 1; i <= nextMonthStartDay; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = i;
            dayDiv.classList.add('fade');
            daysContainer.appendChild(dayDiv);
        }
    }

    function renderMonths() {
        currentView = 'months';
        daysContainer.className = 'days view-months'; 
        weekdaysContainer.style.display = 'none'; 
        monthYear.textContent = currentDate.getFullYear();
        daysContainer.innerHTML = '';
        months.forEach((monthStr, index) => {
            const monthDiv = document.createElement('div');
            monthDiv.textContent = monthStr;
            monthDiv.addEventListener('click', function(e) {
                e.stopPropagation(); 
                currentDate.setMonth(index);
                renderDays();
            });
            daysContainer.appendChild(monthDiv);
        });
    }

    function renderYears() {
        currentView = 'years';
        daysContainer.className = 'days view-years';
        weekdaysContainer.style.display = 'none';
        const currentY = currentDate.getFullYear();
        const startYear = currentY - 4; 
        monthYear.textContent = `${startYear} - ${startYear + 11}`;
        daysContainer.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const yearToShow = startYear + i;
            const yearDiv = document.createElement('div');
            yearDiv.textContent = yearToShow;
            if (yearToShow === today.getFullYear()) yearDiv.classList.add('today'); 
            yearDiv.addEventListener('click', function(e) {
                e.stopPropagation(); 
                currentDate.setFullYear(yearToShow);
                renderMonths();
            });
            daysContainer.appendChild(yearDiv);
        }
    }

    monthYear.addEventListener('click', function(e) {
        e.stopPropagation(); 
        if (currentView === 'days' || currentView === 'months') renderYears();
    });

    prevButton.addEventListener('click', function () {
        if (currentView === 'days') { currentDate.setMonth(currentDate.getMonth() - 1); renderDays(); }
        else if (currentView === 'months') { currentDate.setFullYear(currentDate.getFullYear() - 1); renderMonths(); }
        else if (currentView === 'years') { currentDate.setFullYear(currentDate.getFullYear() - 12); renderYears(); }
    });

    nextButton.addEventListener('click', function () {
        if (currentView === 'days') { currentDate.setMonth(currentDate.getMonth() + 1); renderDays(); }
        else if (currentView === 'months') { currentDate.setFullYear(currentDate.getFullYear() + 1); renderMonths(); }
        else if (currentView === 'years') { currentDate.setFullYear(currentDate.getFullYear() + 12); renderYears(); }
    });

});

function logout() {
    localStorage.removeItem('jwt');
    
    window.location.href = '/login.html';
}

fetchTasks();
fetchCategories();
fetchStats();
populateCategoryModal(); 