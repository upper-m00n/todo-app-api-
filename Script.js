let todos = [];
let filteredTodos = [];
let currentPage = 1;
const itemsPerPage = 10;

const todoList = document.getElementById('todoList');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('errorMsg');
const pagination = document.getElementById('pagination');

document.getElementById('addTodoForm').addEventListener('submit', handleAddTodo);
document.getElementById('searchInput').addEventListener('input', handleSearch);
document.getElementById('fromDate').addEventListener('change', applyFilters);
document.getElementById('toDate').addEventListener('change', applyFilters);

async function fetchTodos() {
  try {
    showLoader();
    const res = await fetch('https://dummyjson.com/todos?limit=100');
    const data = await res.json();
    todos = data.todos.map(todo => ({
      ...todo,
      createdAt: randomDate() 
    }));
    filteredTodos = [...todos];
    renderPaginatedTodos();
  } catch (err) {
    showError('Failed to fetch todos');
  } finally {
    hideLoader();
  }
}


function randomDate() {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


function renderPaginatedTodos() {
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filteredTodos.slice(start, start + itemsPerPage);
  renderTodos(paginated);
  renderPagination();
}


function renderTodos(todosToRender) {
  todoList.innerHTML = '';
  if (todosToRender.length === 0) {
    todoList.innerHTML = '<li class="list-group-item text-center">No todos found.</li>';
    return;
  }

  todosToRender.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${todo.todo}</span>
      <span class="badge ${todo.completed ? 'bg-success' : 'bg-warning'}">
        ${todo.completed ? 'Done' : 'Pending'}
      </span>
    `;
    todoList.appendChild(li);
  });
}


function renderPagination() {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<button class="page-link">${i}</button>`;
    li.addEventListener('click', () => {
      currentPage = i;
      renderPaginatedTodos();
    });
    pagination.appendChild(li);
  }
}


async function handleAddTodo(e) {
  e.preventDefault();
  const input = document.getElementById('todoInput');
  const newTodoText = input.value.trim();
  if (!newTodoText) return;

  try {
    showLoader();
    const res = await fetch('https://dummyjson.com/todos/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo: newTodoText,
        completed: false,
        userId: 1
      })
    });
    const newTodo = await res.json();
    newTodo.createdAt = new Date();
    todos.unshift(newTodo);
    applyFilters(); 
    input.value = '';
  } catch (err) {
    showError('Error adding todo');
  } finally {
    hideLoader();
  }
}


function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  filteredTodos = todos.filter(todo => todo.todo.toLowerCase().includes(query));
  currentPage = 1;
  applyFilters();
}


function applyFilters() {
  const from = document.getElementById('fromDate').valueAsDate;
  const to = document.getElementById('toDate').valueAsDate;

  filteredTodos = todos.filter(todo => {
    const matchSearch = todo.todo.toLowerCase().includes(document.getElementById('searchInput').value.toLowerCase());
    const created = new Date(todo.createdAt);
    const matchFrom = !from || created >= from;
    const matchTo = !to || created <= to;
    return matchSearch && matchFrom && matchTo;
  });

  currentPage = 1;
  renderPaginatedTodos();
}

function showLoader() {
  loader.style.display = 'block';
}
function hideLoader() {
  loader.style.display = 'none';
}
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('d-none');
  setTimeout(() => errorMsg.classList.add('d-none'), 3000);
}


fetchTodos();
