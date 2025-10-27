let tasks = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const totalTasks = document.getElementById('total-tasks');
const completedTasks = document.getElementById('completed-tasks');
const emptyState = document.getElementById('empty-state');

// Load tasks from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedTasks = localStorage.getItem('tasks');
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
    renderTasks();
  }
});

// Form submission
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const taskText = taskInput.value.trim();
  if (taskText === '') {
    showNotification('Tugas tidak boleh kosong!', 'error');
    return;
  }
  
  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date().toLocaleString('id-ID'),
    priority: 'normal'
  };
  
  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  
  taskInput.value = '';
  taskInput.focus();
  showNotification('Tugas berhasil ditambahkan!', 'success');
});

// Search
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(searchTerm)
  );
  renderTasks(filteredTasks);
});

// Render tasks
function renderTasks(tasksToRender = tasks) {
  taskList.innerHTML = '';
  
  if (tasksToRender.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    
    tasksToRender.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.style.animationDelay = `${index * 0.05}s`;
      
      li.innerHTML = `
        <div class="task-content">
          <div class="task-text-wrapper">
            <span class="task-text">${task.text}</span>
            <span class="task-date">${task.createdAt}</span>
          </div>
          <div class="task-actions">
            <div class="task-checkbox">
              <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} 
                     onchange="toggleTask(${task.id})">
              <label for="task-${task.id}" class="checkmark"></label>
            </div>
            <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      
      taskList.appendChild(li);
    });
  }
  
  updateStats();
}

// Toggle task
function toggleTask(id) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks();
    renderTasks();
    
    const message = tasks[taskIndex].completed ? 'Tugas selesai!' : 'Tugas dibatalkan';
    showNotification(message, tasks[taskIndex].completed ? 'success' : 'info');
  }
}

// Delete task (SweetAlert)
function deleteTask(id) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    const taskText = tasks[taskIndex].text;

    Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: `Tugas ${taskText} akan dihapus secara permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        showNotification('Tugas berhasil dihapus!', 'success');
      }
    });
  }
}

// Edit task (SweetAlert)
function editTask(id) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  if (taskIndex !== -1) {
    Swal.fire({
      title: 'Edit Tugas',
      input: 'text',
      inputValue: tasks[taskIndex].text,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (!value.trim()) {
          return 'Tugas tidak boleh kosong!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value.trim() !== '') {
        tasks[taskIndex].text = result.value.trim();
        saveTasks();
        renderTasks();
        showNotification('Tugas berhasil diperbarui!', 'success');
      }
    });
  }
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update stats
function updateStats() {
  totalTasks.textContent = tasks.length;
  completedTasks.textContent = tasks.filter(t => t.completed).length;
}

// SweetAlert Toast Notification
function showNotification(message, type = 'info') {
  let icon = 'info';
  if (type === 'success') icon = 'success';
  if (type === 'error') icon = 'error';
  if (type === 'warning') icon = 'warning';

  Swal.fire({
    icon: icon,
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
  });
}
