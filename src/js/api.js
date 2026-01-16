export default class HelpDeskAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }


  async list() {
    const response = await fetch(`${this.apiUrl}/?method=allTickets`);
    return await response.json();
  }


  async get(id) {
    const response = await fetch(`${this.apiUrl}/?method=ticketById&id=${id}`);
    return await response.json();
  }


  async create(data) {
    const response = await fetch(`${this.apiUrl}/?method=createTicket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }


  async update(id, data) {
    const response = await fetch(`${this.apiUrl}/?method=updateById&id=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }


  async delete(id) {
    const response = await fetch(`${this.apiUrl}/?method=deleteById&id=${id}`);
 
    if (response.status === 204) {
      return true;
    }
    return false;
  }
}