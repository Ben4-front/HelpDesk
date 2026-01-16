import HelpDeskAPI from './api';

export default class HelpDesk {
  constructor(root) {
    this.root = root;
    this.api = new HelpDeskAPI('http://localhost:7070'); 
    
    
    this.container = this.root.querySelector('.tickets-container');
    
    this.modal = document.querySelector('#ticket-modal');
    this.deleteModal = document.querySelector('#delete-modal');
    this.form = document.querySelector('#ticket-form');
    // -------------------------

    this.currentEditId = null;
    this.currentDeleteId = null;
  }

  init() {
    this.loadTickets();
    this.registerEvents();
  }

  registerEvents() {

    const addBtn = this.root.querySelector('.add-ticket-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => this.openModal('add'));
    }


    const cancelBtns = document.querySelectorAll('.cancel-btn'); 
    cancelBtns.forEach(btn => btn.addEventListener('click', () => this.closeModals()));


    if (this.form) {
        this.form.addEventListener('submit', (e) => this.onSubmit(e));
    }


    const confirmDeleteBtn = document.querySelector('.confirm-delete-btn'); // Ищем по документу
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => this.onDeleteConfirm());
    }


    this.container.addEventListener('click', (e) => this.onTicketClick(e));
  }

  async loadTickets() {
    try {
      const tickets = await this.api.list();
      this.renderTickets(tickets);
    } catch (e) {
      console.error('Ошибка загрузки:', e);
    }
  }

  renderTickets(tickets) {
    this.container.innerHTML = '';
    tickets.forEach(ticket => {
      const ticketEl = this.createTicketElement(ticket);
      this.container.appendChild(ticketEl);
    });
  }

  createTicketElement(ticket) {
    const date = new Date(ticket.created).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });

    const el = document.createElement('div');
    el.className = 'ticket';
    el.dataset.id = ticket.id;


    el.innerHTML = `
        <div class="ticket-status">
            <span class="status-circle ${ticket.status ? 'done' : ''}"></span>
        </div>
        <div class="ticket-body">
            <div class="ticket-name">${ticket.name}</div>
        </div>
        <div class="ticket-date">${date}</div>
        <div class="ticket-controls">
            <button type="button" class="control-btn edit-btn">✎</button>
            <button type="button" class="control-btn delete-btn">✖</button>
        </div>
        <div class="ticket-description" style="display: none;">Loading...</div>
    `;
    return el;
  }

  async onTicketClick(e) {
    const ticketEl = e.target.closest('.ticket');
    if (!ticketEl) return;
    
    const id = ticketEl.dataset.id;
    console.log('Клик по тикету ID:', id, 'Цель:', e.target); 


    if (e.target.closest('.ticket-status') || e.target.classList.contains('status-circle')) {
        const circle = ticketEl.querySelector('.status-circle');
        const newStatus = !circle.classList.contains('done');
        

        circle.classList.toggle('done');
        
        try {
            await this.api.update(id, { status: newStatus });
        } catch (err) {
            console.error('Ошибка обновления статуса:', err);

            circle.classList.toggle('done');
        }
        return;
    }


    if (e.target.closest('.edit-btn')) {
        try {
            const fullTicket = await this.api.get(id);
            this.openModal('edit', fullTicket);
        } catch (err) {
            console.error('Ошибка получения тикета:', err);
        }
        return;
    }

    if (e.target.closest('.delete-btn')) {
        this.currentDeleteId = id;

        if (this.deleteModal) {
            this.deleteModal.classList.add('active');
        } else {
            console.error('Модальное окно удаления не найдено в DOM');
        }
        return;
    }

    if (e.target.closest('.ticket-controls')) return;

    if (e.target.closest('.ticket-body')) {
        const descEl = ticketEl.querySelector('.ticket-description');
        
        if (descEl.style.display === 'block') {
            descEl.style.display = 'none';
        } else {
            descEl.style.display = 'block';
            

            if (descEl.textContent === 'Loading...' || descEl.textContent === '') {
                 try {
                     const fullTicket = await this.api.get(id);
                     descEl.textContent = fullTicket.description || 'Нет описания';
                 } catch (err) {
                     descEl.textContent = 'Ошибка загрузки описания';
                 }
            }
        }
    }
  }

  openModal(mode, ticketData = null) {
    if (!this.modal) return;
    
    const title = this.modal.querySelector('.modal-title');
    const nameInput = this.form.querySelector('.input-name');
    const descInput = this.form.querySelector('.input-desc');

    this.modal.classList.add('active');
    
    if (mode === 'edit' && ticketData) {
        title.textContent = 'Изменить тикет';
        nameInput.value = ticketData.name;
        descInput.value = ticketData.description;
        this.currentEditId = ticketData.id;
    } else {
        title.textContent = 'Добавить тикет';
        this.form.reset();
        this.currentEditId = null;
    }
  }

  closeModals() {
    if (this.modal) this.modal.classList.remove('active');
    if (this.deleteModal) this.deleteModal.classList.remove('active');
    if (this.form) this.form.reset();
  }

  async onSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);
    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
    };

    try {
        if (this.currentEditId) {
            await this.api.update(this.currentEditId, data);
        } else {
            data.status = false;
            await this.api.create(data);
        }
        this.closeModals();
        this.loadTickets();
    } catch (err) {
        console.error('Ошибка при сохранении:', err);
    }
  }

  async onDeleteConfirm() {
    if (this.currentDeleteId) {
        try {
            await this.api.delete(this.currentDeleteId);
            this.currentDeleteId = null;
            this.closeModals();
            this.loadTickets();
        } catch (err) {
            console.error('Ошибка удаления:', err);
        }
    }
  }
}