// Estado inicial de la aplicación
const state = {
    currentView: 'home', // vistas: home, calendar, classes, archived, settings, sectionDetail
    currentSection: null, // id de la sección seleccionada
    images: JSON.parse(localStorage.getItem('albumClassImages')) || [], // Fotos sin clase (Inicio)
    classes: JSON.parse(localStorage.getItem('albumClassClasses')) || [],
    settings: JSON.parse(localStorage.getItem('albumClassSettings')) || { username: 'Usuario', email: '' }
  };
  
  document.addEventListener('DOMContentLoaded', initApp);
  
  function initApp() {
    renderView(state.currentView);
    updateNavigation();
  
    // Eventos en la cabecera
    document.querySelector('.menu-btn').addEventListener('click', toggleSidebar);
    document.querySelector('.add-btn').addEventListener('click', openSectionModal);
    document.querySelector('.search-btn').addEventListener('click', handleSearch);
  
    // Cerrar modales
    document.getElementById('sectionModalClose').addEventListener('click', closeSectionModal);
    document.getElementById('photoModalClose').addEventListener('click', closePhotoModal);
    document.getElementById('photoNoClassModalClose').addEventListener('click', closePhotoNoClassModal);
    document.getElementById('photoPreviewModalClose').addEventListener('click', closePhotoPreviewModal);
  
    // Navegación en el sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', handleNavClick);
    });
  
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('dropdownContainer');
      if (!dropdown.contains(e.target)) {
        dropdown.innerHTML = '';
      }
    });
  }
  
  // Alterna el sidebar (menú hamburger)
  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
  }
  
  // Actualiza la navegación (resalta la vista activa)
  function updateNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === state.currentView);
    });
  }
  
  // Maneja la navegación del sidebar
  function handleNavClick(e) {
    const view = e.currentTarget.dataset.view;
    state.currentView = view;
    renderView(view);
    updateNavigation();
    document.querySelector('.sidebar').classList.remove('open');
  }
  
  // Renderiza la vista seleccionada
  function renderView(view) {
    const mainContent = document.getElementById('mainContent');
    let html = '';
    switch(view) {
      case 'home':
        html = renderHomeView();
        break;
      case 'calendar':
        html = renderCalendarView();
        break;
      case 'classes':
        html = renderClassesView();
        break;
      case 'archived':
        html = renderArchivedView();
        break;
      case 'settings':
        html = renderSettingsView();
        setTimeout(() => {
          document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
        }, 0);
        break;
      case 'sectionDetail':
        html = renderSectionDetailView();
        break;
      default:
        html = `<p>Vista no encontrada</p>`;
    }
    mainContent.innerHTML = html;
  }
  
  // Vistas Base
  
  function renderHomeView(imagesArray = state.images) {
    if (imagesArray.length === 0) {
      return `
        <div class="empty-state">
          <i class="fas fa-images"></i>
          <h2>No hay imágenes disponibles</h2>
          <p>Sube tus primeras imágenes usando el botón +</p>
        </div>
      `;
    }
    return `
      <div class="classes-grid">
        ${imagesArray.map(img => `
          <div class="class-card" data-id="${img.id}">
            <div class="class-header ${getRandomColor()}">
              <div class="class-title">${img.subject}</div>
              <button class="menu-dots" onclick="showImageDropdown(event, '${img.id}')" aria-label="Opciones">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div class="class-content">
              <div class="thumbnails">
                <img src="${img.data}" alt="${img.description}" loading="lazy" onclick="openPhotoPreview(${img.id}, 'home')">
              </div>
            </div>
            <div class="class-footer">
              <span>${img.description}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  function renderClassesView() {
    const activeClasses = state.classes.filter(c => !c.archived);
    if (activeClasses.length === 0) {
      return `
        <div class="empty-state">
          <i class="fas fa-graduation-cap"></i>
          <h2>No tienes secciones creadas</h2>
          <p>Crea tu primera sección usando el botón +</p>
        </div>
      `;
    }
    return `
      <div class="classes-grid">
        ${activeClasses.map(cls => `
          <div class="class-card" data-id="${cls.id}" onclick="openSectionDetail('${cls.id}')">
            <div class="class-header blue">
              <div class="class-title">${cls.name}</div>
              <button class="menu-dots" onclick="showSectionDropdown(event, '${cls.id}')" aria-label="Opciones">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div class="class-footer">
              <small>Código: ${cls.code}</small>
            </div>
            ${cls.photos && cls.photos.length ? `
              <div class="thumbnails">
                ${cls.photos.slice(0,3).map(photo => `<img src="${photo.data}" alt="${photo.description}" loading="lazy" onclick="openPhotoPreview(${photo.id}, 'section', '${cls.id}')">`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  function renderArchivedView() {
    const archivedClasses = state.classes.filter(c => c.archived);
    if (archivedClasses.length === 0) {
      return `
        <div class="empty-state">
          <i class="fas fa-archive"></i>
          <h2>No hay secciones archivadas</h2>
          <p>Las secciones archivadas aparecerán aquí.</p>
        </div>
      `;
    }
    return `
      <div class="classes-grid">
        ${archivedClasses.map(cls => `
          <div class="class-card" data-id="${cls.id}" onclick="openSectionDetail('${cls.id}')">
            <div class="class-header gray">
              <div class="class-title">${cls.name}</div>
              <button class="menu-dots" onclick="showSectionDropdown(event, '${cls.id}')" aria-label="Opciones">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div class="class-footer">
              <small>Código: ${cls.code}</small>
            </div>
            ${cls.photos && cls.photos.length ? `
              <div class="thumbnails">
                ${cls.photos.slice(0,3).map(photo => `<img src="${photo.data}" alt="${photo.description}" loading="lazy" onclick="openPhotoPreview(${photo.id}, 'section', '${cls.id}')">`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  function renderCalendarView() {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const events = {};
    state.classes.forEach(cls => {
      if (cls.createdAt && !cls.archived) {
        const date = new Date(cls.createdAt);
        const day = date.getDate();
        if (!events[day]) events[day] = [];
        events[day].push(cls);
      }
    });
    return `
      <div class="calendar-grid">
        ${days.map(day => `
          <div class="calendar-day">
            <div class="date">${day}</div>
            ${events[day] ? events[day].map(cls => `<div class="event-marker" title="${cls.name}"></div>`).join('') : ''}
          </div>
        `).join('')}
      </div>
    `;
  }
  
  function renderSettingsView() {
    return `
      <div class="settings-form">
        <h2>Configuración de cuenta</h2>
        <div class="form-group">
          <label>Nombre de usuario</label>
          <input type="text" id="usernameInput" value="${state.settings.username}">
        </div>
        <div class="form-group">
          <label>Correo electrónico</label>
          <input type="email" id="emailInput" value="${state.settings.email}">
        </div>
        <button id="saveSettingsBtn">Guardar</button>
      </div>
    `;
  }
  
  function renderSectionDetailView() {
    const cls = state.classes.find(c => c.id == state.currentSection);
    if (!cls) return `<p>Sección no encontrada.</p>`;
    
    const searchQuery = document.querySelector('.search-bar')?.value.trim().toLowerCase() || '';
    let photos = cls.photos || [];
    if (searchQuery) {
      photos = photos.filter(photo => photo.description.toLowerCase().includes(searchQuery));
    }
    
    return `
      <div class="section-detail">
        <div class="section-header">
          <h2>${cls.name}</h2>
          <button class="dropdown-toggle" onclick="showSectionDropdown(event, '${cls.id}')">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
        <p><strong>Código:</strong> ${cls.code}</p>
        <p><strong>Asignatura:</strong> ${cls.subject || '-'}</p>
        <p><strong>Sala:</strong> ${cls.room || '-'}</p>
        <p><strong>Creado:</strong> ${new Date(cls.createdAt).toLocaleDateString()}</p>
        <hr>
        <h3>Fotos</h3>
        ${photos.length === 0 
          ? `<div class="empty-state">
                <i class="fas fa-image"></i>
                <p>No hay fotos en esta sección.</p>
             </div>`
          : `<div class="classes-grid">
               ${photos.map(photo => `
                 <div class="class-card" data-id="${photo.id}">
                   <div class="class-header ${getRandomColor()}">
                     <div class="class-title">${photo.description}</div>
                     <button class="menu-dots" onclick="showPhotoDropdown(event, '${cls.id}', '${photo.id}')" aria-label="Opciones">
                       <i class="fas fa-ellipsis-v"></i>
                     </button>
                   </div>
                   <div class="class-content">
                     <div class="thumbnails">
                       <img src="${photo.data}" alt="${photo.description}" loading="lazy" onclick="openPhotoPreview(${photo.id}, 'section', '${cls.id}')">
                     </div>
                   </div>
                 </div>
               `).join('')}
             </div>`
        }
        <div style="margin-top:16px; text-align: center;">
          <button class="dropdown-toggle" onclick="openPhotoModal()">Subir Foto</button>
        </div>
      </div>
    `;
  }
  
  // Función genérica para mostrar dropdowns
  function showDropdown(options, event) {
    event.stopPropagation();
    const dropdownContainer = document.getElementById('dropdownContainer');
    dropdownContainer.innerHTML = ''; // Limpiar dropdown previo
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        opt.action();
        dropdownContainer.innerHTML = '';
      });
      dropdown.appendChild(btn);
    });
    const rect = event.currentTarget.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdownContainer.appendChild(dropdown);
  }
  
  function showSectionDropdown(e, sectionId) {
    e.stopPropagation();
    const options = [
      { label: 'Modificar Sección', action: () => showEditSectionForm(sectionId) },
      { label: 'Archivar Sección', action: () => archiveSection(sectionId) },
      { label: 'Eliminar Sección', action: () => handleDeleteSection(sectionId) }
    ];
    showDropdown(options, e);
  }
  
  function showPhotoDropdown(e, sectionId, photoId) {
    e.stopPropagation();
    const options = [
      { label: 'Editar Foto', action: () => editPhoto(sectionId, photoId) },
      { label: 'Eliminar Foto', action: () => deletePhoto(sectionId, photoId) }
    ];
    showDropdown(options, e);
  }
  
  // Funciones para el Modal de Sección
  
  function openSectionModal() {
    const sectionModal = document.getElementById('sectionModal');
    sectionModal.classList.remove('hidden');
    document.getElementById('createSectionBtn').addEventListener('click', showCreateSectionForm);
    document.getElementById('joinSectionBtn').addEventListener('click', () => {
      alert('Funcionalidad de unirse a una sección en desarrollo.');
    });
    document.getElementById('uploadNoClassBtn').addEventListener('click', openPhotoNoClassModal);
  }
  
  function closeSectionModal() {
    const sectionModal = document.getElementById('sectionModal');
    sectionModal.classList.add('hidden');
    document.getElementById('sectionModalBody').innerHTML = `
      <h3>Selecciona una opción</h3>
      <button id="createSectionBtn">Crear sección</button>
      <button id="joinSectionBtn">Unirse a sección</button>
      <button id="uploadNoClassBtn">Subir foto sin clase</button>
    `;
    document.getElementById('createSectionBtn').addEventListener('click', showCreateSectionForm);
    document.getElementById('joinSectionBtn').addEventListener('click', () => {
      alert('Funcionalidad de unirse a una sección en desarrollo.');
    });
    document.getElementById('uploadNoClassBtn').addEventListener('click', openPhotoNoClassModal);
  }
  
  function showCreateSectionForm() {
    const modalBody = document.getElementById('sectionModalBody');
    modalBody.innerHTML = `
      <h3>Crear Sección</h3>
      <form id="createSectionForm">
        <div class="form-group">
          <label>Nombre de la sección <span style="color:red">*</span></label>
          <input type="text" id="sectionName" required>
        </div>
        <div class="form-group">
          <label>Asignatura</label>
          <input type="text" id="sectionSubject">
        </div>
        <div class="form-group">
          <label>Sala</label>
          <input type="text" id="sectionRoom">
        </div>
        <button type="submit">Crear Sección</button>
      </form>
    `;
    document.getElementById('createSectionForm').addEventListener('submit', handleCreateSection);
  }
  
  function handleCreateSection(e) {
    e.preventDefault();
    const name = document.getElementById('sectionName').value.trim();
    const subject = document.getElementById('sectionSubject').value.trim();
    const room = document.getElementById('sectionRoom').value.trim();
    if (!name) {
      alert('El nombre de la sección es obligatorio.');
      return;
    }
    const newClass = {
      id: Date.now() + Math.random(),
      name: name,
      subject: subject,
      room: room,
      code: generateUniqueCode(),
      photos: [],
      createdAt: new Date().toISOString(),
      archived: false
    };
    state.classes.push(newClass);
    saveState();
    renderView('classes');
    closeSectionModal();
    alert('Sección creada exitosamente.');
  }
  
  function generateUniqueCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  function showEditSectionForm(sectionId) {
    const cls = state.classes.find(c => c.id == sectionId);
    if (!cls) return;
    const sectionModal = document.getElementById('sectionModal');
    sectionModal.classList.remove('hidden');
    const modalBody = document.getElementById('sectionModalBody');
    modalBody.innerHTML = `
      <h3>Editar Sección</h3>
      <form id="editSectionForm">
        <div class="form-group">
          <label>Nombre de la sección <span style="color:red">*</span></label>
          <input type="text" id="editSectionName" value="${cls.name}" required>
        </div>
        <div class="form-group">
          <label>Asignatura</label>
          <input type="text" id="editSectionSubject" value="${cls.subject}">
        </div>
        <div class="form-group">
          <label>Sala</label>
          <input type="text" id="editSectionRoom" value="${cls.room}">
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
    `;
    document.getElementById('editSectionForm').addEventListener('submit', function(e) {
      e.preventDefault();
      cls.name = document.getElementById('editSectionName').value.trim();
      cls.subject = document.getElementById('editSectionSubject').value.trim();
      cls.room = document.getElementById('editSectionRoom').value.trim();
      saveState();
      renderView('sectionDetail');
      closeSectionModal();
      alert('Sección actualizada.');
    });
  }
  
  function handleDeleteSection(sectionId) {
    if (confirm('¿Estás seguro de eliminar esta sección?')) {
      state.classes = state.classes.filter(c => c.id != sectionId);
      saveState();
      state.currentView = 'classes';
      renderView('classes');
      alert('Sección eliminada.');
    }
  }
  
  function archiveSection(sectionId) {
    const cls = state.classes.find(c => c.id == sectionId);
    if (!cls) return;
    cls.archived = true;
    saveState();
    state.currentView = 'archived';
    renderView('archived');
    alert('Sección archivada.');
  }
  
  // Funciones para el Modal de Foto en Sección
  
  function openPhotoModal() {
    const photoModal = document.getElementById('photoModal');
    photoModal.classList.remove('hidden');
    document.getElementById('photoUploadForm').addEventListener('submit', handlePhotoUpload);
  }
  
  function closePhotoModal() {
    const photoModal = document.getElementById('photoModal');
    photoModal.classList.add('hidden');
    document.getElementById('photoUploadForm').reset();
  }
  
  async function handlePhotoUpload(e) {
    e.preventDefault();
    const description = document.getElementById('photoDescription').value.trim();
    const file = document.getElementById('photoInput').files[0];
    if (!description || !file) {
      alert('Se requiere descripción y seleccionar una foto.');
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    const newPhoto = {
      id: Date.now() + Math.random(),
      description: description,
      data: dataUrl,
      timestamp: new Date().toISOString()
    };
    const cls = state.classes.find(c => c.id == state.currentSection);
    if (!cls.photos) cls.photos = [];
    cls.photos.push(newPhoto);
    saveState();
    renderView('sectionDetail');
    closePhotoModal();
    alert('Foto subida.');
  }
  
  // Funciones para el Modal de Foto sin Clase (para Inicio)
  
  function openPhotoNoClassModal() {
    closeSectionModal();
    const modal = document.getElementById('photoNoClassModal');
    modal.classList.remove('hidden');
    document.getElementById('photoNoClassForm').addEventListener('submit', handlePhotoNoClassUpload);
  }
  
  function closePhotoNoClassModal() {
    const modal = document.getElementById('photoNoClassModal');
    modal.classList.add('hidden');
    document.getElementById('photoNoClassForm').reset();
  }
  
  async function handlePhotoNoClassUpload(e) {
    e.preventDefault();
    const subject = document.getElementById('photoNoClassSubject').value.trim();
    const description = document.getElementById('photoNoClassDescription').value.trim();
    const file = document.getElementById('photoNoClassInput').files[0];
    if (!subject || !description || !file) {
      alert('Se requieren asignatura, descripción y seleccionar una foto.');
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    const newPhoto = {
      id: Date.now() + Math.random(),
      subject: subject,
      description: description,
      data: dataUrl,
      timestamp: new Date().toISOString()
    };
    state.images.push(newPhoto);
    saveState();
    renderView('home');
    closePhotoNoClassModal();
    alert('Foto subida en Inicio.');
  }
  
  // Función para leer archivo como DataURL
  function readFileAsDataURL(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
  
  // Funciones para vista previa de foto ampliada
  function openPhotoPreview(photoId, source, sectionId = null) {
    let photo;
    if (source === 'home') {
      photo = state.images.find(p => p.id == photoId);
    } else if (source === 'section') {
      const cls = state.classes.find(c => c.id == sectionId);
      if (cls) photo = cls.photos.find(p => p.id == photoId);
    }
    if (!photo) return;
    const previewModal = document.getElementById('photoPreviewModal');
    document.getElementById('previewImage').src = photo.data;
    document.getElementById('previewDescription').innerText = photo.description;
    previewModal.classList.remove('hidden');
  }
  
  function closePhotoPreviewModal() {
    const previewModal = document.getElementById('photoPreviewModal');
    previewModal.classList.add('hidden');
  }
  
  // Funciones para Dropdowns
  function showDropdown(options, event) {
    event.stopPropagation();
    const dropdownContainer = document.getElementById('dropdownContainer');
    dropdownContainer.innerHTML = ''; // Limpiar dropdown previo
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        opt.action();
        dropdownContainer.innerHTML = '';
      });
      dropdown.appendChild(btn);
    });
    const rect = event.currentTarget.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdownContainer.appendChild(dropdown);
  }
  
  function showSectionDropdown(e, sectionId) {
    e.stopPropagation();
    const options = [
      { label: 'Modificar Sección', action: () => showEditSectionForm(sectionId) },
      { label: 'Archivar Sección', action: () => archiveSection(sectionId) },
      { label: 'Eliminar Sección', action: () => handleDeleteSection(sectionId) }
    ];
    showDropdown(options, e);
  }
  
  function showImageDropdown(e, imageId) {
    // Opciones para imágenes en Inicio (por ahora se puede agregar editar/eliminar similarmente)
    e.stopPropagation();
    const options = [
      { label: 'Eliminar Foto', action: () => {
          state.images = state.images.filter(img => img.id != imageId);
          saveState();
          renderView('home');
          alert('Foto eliminada.');
        }
      }
    ];
    showDropdown(options, e);
  }
  
  function showPhotoDropdown(e, sectionId, photoId) {
    e.stopPropagation();
    const options = [
      { label: 'Editar Foto', action: () => editPhoto(sectionId, photoId) },
      { label: 'Eliminar Foto', action: () => deletePhoto(sectionId, photoId) }
    ];
    showDropdown(options, e);
  }
  
  function editPhoto(sectionId, photoId) {
    const cls = state.classes.find(c => c.id == sectionId);
    if (!cls) return;
    const photo = cls.photos.find(p => p.id == photoId);
    const newDesc = prompt('Editar descripción:', photo.description);
    if (newDesc !== null) {
      photo.description = newDesc.trim();
      saveState();
      renderView('sectionDetail');
      alert('Foto actualizada.');
    }
  }
  
  // Función de búsqueda
  function handleSearch() {
    const query = document.querySelector('.search-bar').value.trim().toLowerCase();
    if (state.currentView === 'sectionDetail') {
      renderView('sectionDetail');
    } else if (state.currentView === 'home') {
      const imagesToRender = state.images.filter(img => {
        return img.subject.toLowerCase().includes(query) ||
               img.description.toLowerCase().includes(query);
      });
      document.getElementById('mainContent').innerHTML = renderHomeView(imagesToRender);
    }
  }
  
  // Utilidad para obtener un color aleatorio
  function getRandomColor() {
    const colors = ['green', 'blue', 'red'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Guarda el estado en localStorage
  function saveState() {
    localStorage.setItem('albumClassImages', JSON.stringify(state.images));
    localStorage.setItem('albumClassClasses', JSON.stringify(state.classes));
    localStorage.setItem('albumClassSettings', JSON.stringify(state.settings));
  }
  
  // Guarda la configuración
  function saveSettings() {
    const username = document.getElementById('usernameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    state.settings.username = username;
    state.settings.email = email;
    saveState();
    alert('Configuración guardada.');
  }
  
  // Abre la vista detallada de una sección
  function openSectionDetail(sectionId) {
    state.currentSection = sectionId;
    state.currentView = 'sectionDetail';
    renderView('sectionDetail');
    updateNavigation();
  }
  