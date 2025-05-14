// Datos globales
let allResolutions = [];
let filteredResolutions = [];
const CORRECT_PASSWORD = 'ktmmgs00';

// Elementos del DOM
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const submitPasswordBtn = document.getElementById('submitPasswordBtn');
const passwordError = document.getElementById('passwordError');
const mainContent = document.querySelector('.main-content');
const searchType = document.getElementById('searchType');
const searchTerm = document.getElementById('searchTerm');
const yearFilter = document.getElementById('yearFilter');
const noResults = document.getElementById('noResults');
const tableBody = document.getElementById('tableBody');

// Mostrar modal de contraseña al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    passwordInput.value = '';
    passwordInput.setAttribute('autocomplete', 'new-password');
    passwordModal.style.display = 'flex';
    mainContent.style.display = 'none';
    setTimeout(() => passwordInput.focus(), 100);
    updatePlaceholder();
});

// Manejadores de eventos
submitPasswordBtn.addEventListener('click', checkPassword);
passwordInput.addEventListener('keypress', (e) => e.key === 'Enter' && checkPassword());
searchType.addEventListener('change', () => {
    updatePlaceholder();
    searchData();
});
searchTerm.addEventListener('keyup', searchData);
yearFilter.addEventListener('change', searchData);

// Función para verificar la contraseña
function checkPassword() {
    if (passwordInput.value === CORRECT_PASSWORD) {
        passwordModal.style.display = 'none';
        mainContent.style.display = 'block';
        loadData();
    } else {
        passwordError.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Función para cargar datos
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');
        const data = await response.json();
        allResolutions = data.resolutions;
        filteredResolutions = [...allResolutions];
        renderTable(allResolutions);
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar los datos. Por favor recargue la página.');
    }
}

// Función para renderizar la tabla
function renderTable(data) {
    tableBody.innerHTML = '';
    noResults.style.display = data.length ? 'none' : 'block';

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.Resolucion}</td>
            <td>${item.Codigo}</td>
            <td>${item.Expediente}</td>
            <td>${item.Tema_Caratula}</td>
            <td><a href="${item.PDF}" class="pdf-link" target="_blank">Ver PDF</a></td>
            <td>${item.Anio}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para actualizar el placeholder
function updatePlaceholder() {
    const placeholders = {
        'resolucion': 'Ej: R15 (búsqueda exacta)',
        'tema': 'Buscar por tema...',
        'expediente': 'Buscar por expediente...',
        'all': 'Buscar...'
    };
    searchTerm.placeholder = placeholders[searchType.value] || 'Buscar...';
}

// Función para buscar datos (CORRECCIÓN PRINCIPAL)
function searchData() {
    const searchTermValue = searchTerm.value.trim();
    const searchTypeValue = searchType.value;
    const yearFilterValue = yearFilter.value;

    filteredResolutions = allResolutions.filter(item => {
        // Filtrar por año
        if (yearFilterValue !== 'all' && item.Anio !== yearFilterValue) return false;
        
        // Si no hay término de búsqueda
        if (!searchTermValue) return true;
        
        // Búsqueda exacta o parcial según el tipo
        switch(searchTypeValue) {
            case 'resolucion':
                return item.Resolucion.toUpperCase() === searchTermValue.toUpperCase();
            case 'tema':
                return item.Tema_Caratula.toLowerCase().includes(searchTermValue.toLowerCase());
            case 'expediente':
                return item.Expediente === searchTermValue;
            default:
                return (
                    item.Resolucion.toUpperCase().includes(searchTermValue.toUpperCase()) ||
                    item.Codigo.toUpperCase().includes(searchTermValue.toUpperCase()) ||
                    item.Expediente.includes(searchTermValue) ||
                    item.Tema_Caratula.toLowerCase().includes(searchTermValue.toLowerCase()) ||
                    item.Anio.includes(searchTermValue)
                );
        }
    });
    
    renderTable(filteredResolutions);
}

// Función para mostrar errores
function showError(message) {
    noResults.textContent = message;
    noResults.style.display = 'block';
}