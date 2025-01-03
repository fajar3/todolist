// Selectors
const todoInput = document.querySelector('.todo-input');
const authorInput = document.querySelector('.author-input');
const todoButton = document.querySelector('.todo-btn');
const priorityList = document.querySelector('.priority-list');
const otherList = document.querySelector('.other-list');
const themeSelectors = document.querySelectorAll('.theme-selector');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadTodos);
todoButton.addEventListener('click', addTodo);
themeSelectors.forEach(selector => {
    selector.addEventListener('click', (e) => {
        const theme = e.target.classList[0].split('-')[0];
        changeTheme(theme);
    });
});

// Add the missing formatDate function
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(date).toLocaleString('en-US', options);
}

// Functions
function createTodoElement(todoText, author, isPriority = false, isCompleted = false) {
    const li = document.createElement('li');
    li.classList.add('todo-item', `${getCurrentTheme()}-todo`);

    const text = document.createElement('span');
    text.classList.add('todo-text');
    text.textContent = todoText;
    if (isCompleted) text.classList.add('completed');
    
    const authorSpan = document.createElement('span');
    authorSpan.classList.add('todo-author');
    authorSpan.textContent = `Added by: ${author}`;
    
    const actions = document.createElement('div');
    actions.classList.add('todo-actions');
    
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.classList.add('edit-btn', `${getCurrentTheme()}-button`);
    editBtn.onclick = () => editTodo(li);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.classList.add('delete-btn', `${getCurrentTheme()}-button`);
    deleteBtn.onclick = () => deleteTodo(li);
    
    const checkBtn = document.createElement('button');
    checkBtn.innerHTML = '<i class="fas fa-check"></i>';
    checkBtn.classList.add('check-btn', `${savedTheme}-button`);

    const priorityBtn = document.createElement('button');
    priorityBtn.innerHTML = '<i class="fas fa-star"></i>';
    priorityBtn.classList.add('priority-btn', `${getCurrentTheme()}-button`);
    priorityBtn.onclick = () => togglePriority(li);
    
    const timestamp = document.createElement('span');
    timestamp.classList.add('todo-timestamp');
    timestamp.textContent = formatDate(new Date());

    text.addEventListener('click', () => toggleComplete(text));
    checkBtn.addEventListener('click', function() {
        li.classList.toggle('completed');});

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(priorityBtn);
    actions.appendChild(checkBtn);
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('todo-info');
    infoDiv.appendChild(authorSpan);
    infoDiv.appendChild(timestamp);
    
    li.appendChild(text);
    li.appendChild(infoDiv);
    li.appendChild(actions);
    return li;
}

function addTodo(e) {
    e.preventDefault();
    
    // Get the input values
    const taskText = todoInput.value.trim();
    const authorName = authorInput.value.trim();
    
    // Check if both fields are filled
    if (!taskText) {
        todoInput.classList.add('invalid');
        todoInput.setAttribute('title', 'Task is required');
        return;
    }
    
    if (!authorName) {
        authorInput.classList.add('invalid');
        authorInput.setAttribute('title', 'Author name is required');
        return;
    }
    
    // Create and add the todo
    const todo = createTodoElement(taskText, authorName);
    otherList.appendChild(todo);
    

    // Clear inputs and remove any invalid states
    todoInput.value = '';
    authorInput.value = '';
    todoInput.classList.remove('invalid');
    authorInput.classList.remove('invalid');
    
    saveTodos();
}

// Add event listeners to remove invalid state when user starts typing
todoInput.addEventListener('input', () => {
    todoInput.classList.remove('invalid');
});

authorInput.addEventListener('input', () => {
    authorInput.classList.remove('invalid');
});

function editTodo(todoItem) {
    const textSpan = todoItem.querySelector('.todo-text');
    const currentText = textSpan.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.classList.add('edit-input', `${getCurrentTheme()}-input`);
    
    todoItem.replaceChild(input, textSpan);
    input.focus();
    
    input.addEventListener('blur', () => {
        const newText = input.value.trim();
        if (newText) {
            textSpan.textContent = newText;
            todoItem.replaceChild(textSpan, input);
            saveTodos();
        }
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') input.blur();
    });
}

function deleteTodo(todoItem) {
    todoItem.remove();
    saveTodos();
}

function togglePriority(todoItem) {
    const targetList = todoItem.parentElement === priorityList ? otherList : priorityList;
    targetList.appendChild(todoItem);
    saveTodos();
}

function toggleComplete(textElement) {
    textElement.classList.toggle('completed');
    saveTodos();
}

function saveTodos() {
    const todos = {
        priority: Array.from(priorityList.children).map(todo => ({
            text: todo.querySelector('.todo-text').textContent,
            author: todo.querySelector('.todo-author').textContent.replace('Added by: ', ''),
            completed: todo.querySelector('.todo-text').classList.contains('completed')
        })),
        other: Array.from(otherList.children).map(todo => ({
            text: todo.querySelector('.todo-text').textContent,
            author: todo.querySelector('.todo-author').textContent.replace('Added by: ', ''),
            completed: todo.querySelector('.todo-text').classList.contains('completed')
        }))
    };
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || { priority: [], other: [] };
    
    todos.priority.forEach(todo => {
        const todoElement = createTodoElement(todo.text, todo.author, true, todo.completed);
        priorityList.appendChild(todoElement);
    });
    
    todos.other.forEach(todo => {
        const todoElement = createTodoElement(todo.text, todo.author, false, todo.completed);
        otherList.appendChild(todoElement);
    });
}

const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'light' : 'standard';
    changeTheme(theme);
});

function getCurrentTheme() {
    return document.body.classList.value || 'standard';
}

function changeTheme(theme) {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
    
    document.querySelectorAll('input').forEach(input => {
        input.className = input.className.replace(/standard|light/, theme);
    });
    
    document.querySelectorAll('button').forEach(button => {
        button.className = button.className.replace(/standard|light/, theme);
    });
    
    document.querySelectorAll('.todo-item').forEach(item => {
        item.className = item.className.replace(/standard|light/, theme);
    });
}

const savedTheme = localStorage.getItem('theme') || 'standard';
themeToggle.checked = savedTheme === 'light';
changeTheme(savedTheme);