import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { Card, Button, Badge, Input, Select, Modal } from '@/components/UI';
import type { Ticket, TicketFormData, TicketStatus, TicketPriority } from '@/types';
import styles from './TicketsPage.module.scss';

export const TicketsPage = observer(() => {
  const { filteredTickets, activeCategories, activeAgents, getCategoryById, getAgentById, getMessagesForTicket, createTicket, updateTicket, assignTicket, createMessage, loadAllData, ticketsLoading, setFilter, filters } = dataStore;
  const { isAgent, canManageTickets } = authStore;
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [form, setForm] = useState<TicketFormData>({ subject: '', description: '', priority: 'medium', categoryId: '', customerName: '', customerEmail: '' });

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const statusLabels: Record<TicketStatus, string> = { open: 'Открыт', in_progress: 'В работе', pending: 'Ожидает', resolved: 'Решён', closed: 'Закрыт' };
  const statusColors: Record<TicketStatus, 'info' | 'warning' | 'success' | 'error'> = { open: 'info', in_progress: 'warning', pending: 'warning', resolved: 'success', closed: 'success' };
  const priorityLabels: Record<TicketPriority, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' };
  const priorityColors: Record<TicketPriority, 'info' | 'warning' | 'error'> = { low: 'info', medium: 'warning', high: 'error', critical: 'error' };

  const categoryOptions = [{ value: '', label: 'Все категории' }, ...activeCategories.map(c => ({ value: c.id, label: c.name }))];
  const statusOptions = [{ value: '', label: 'Все статусы' }, ...Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))];

  const openCreateModal = () => { setForm({ subject: '', description: '', priority: 'medium', categoryId: activeCategories[0]?.id || '', customerName: '', customerEmail: '' }); setModalOpen(true); };

  const handleCreateTicket = async () => {
    if (!form.subject || !form.description || !form.customerName || !form.customerEmail) { uiStore.showError('Заполните все поля'); return; }
    await createTicket(form);
    uiStore.showSuccess('Тикет создан');
    setModalOpen(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    await createMessage({ ticketId: selectedTicket.id, content: newMessage, isInternal: false }, isAgent ? 'Агент' : selectedTicket.customerName);
    setNewMessage('');
    uiStore.showSuccess('Сообщение отправлено');
  };

  const handleAssign = async (ticketId: string, agentId: string) => {
    await assignTicket(ticketId, agentId);
    uiStore.showSuccess('Тикет назначен');
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    await updateTicket(ticketId, { status });
    uiStore.showSuccess('Статус обновлён');
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Тикеты</h1><p className={styles.subtitle}>Управление обращениями</p></div>
        <Button variant="primary" onClick={openCreateModal}>Создать тикет</Button>
      </div>

      <Card className={styles.toolbar}>
        <Input placeholder="Поиск тикетов..." value={filters.search || ''} onChange={(e) => setFilter('search', e.target.value || undefined)} className={styles.searchInput} />
        <Select options={categoryOptions} value={filters.categoryId || ''} onChange={(e) => setFilter('categoryId', e.target.value || undefined)} />
        <Select options={statusOptions} value={filters.status || ''} onChange={(e) => setFilter('status', e.target.value || undefined)} />
      </Card>

      {ticketsLoading ? <Card className={styles.loading}>Загрузка...</Card> : filteredTickets.length === 0 ? <Card className={styles.empty}>Тикеты не найдены</Card> : (
        <div className={styles.ticketsList}>
          {filteredTickets.map(ticket => (
            <Card key={ticket.id} className={styles.ticketCard} hoverable onClick={() => setSelectedTicket(ticket)}>
              <div className={styles.ticketHeader}>
                <div className={styles.ticketMeta}>
                  <Badge variant={priorityColors[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
                  <Badge variant={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
                </div>
                <span className={styles.ticketDate}>{formatDate(ticket.createdAt)}</span>
              </div>
              <h3 className={styles.ticketSubject}>{ticket.subject}</h3>
              <p className={styles.ticketDescription}>{ticket.description.substring(0, 100)}...</p>
              <div className={styles.ticketFooter}>
                <span className={styles.ticketCustomer}>{ticket.customerName}</span>
                <span className={styles.ticketCategory}>{getCategoryById(ticket.categoryId)?.name}</span>
                {ticket.assignedAgentId && <span className={styles.ticketAgent}>{getAgentById(ticket.assignedAgentId)?.lastName}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Создать тикет"
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleCreateTicket}>Создать</Button></div>}>
        <div className={styles.form}>
          <Input label="Ваше имя *" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <Input label="Email *" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
          <Select label="Категория" options={activeCategories.map(c => ({ value: c.id, label: c.name }))} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} />
          <Select label="Приоритет" options={Object.entries(priorityLabels).map(([v, l]) => ({ value: v, label: l }))} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })} />
          <Input label="Тема *" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Input label="Описание *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.subject || ''} size="lg">
        {selectedTicket && (
          <div className={styles.ticketDetail}>
            <div className={styles.detailHeader}>
              <div className={styles.detailMeta}>
                <Badge variant={priorityColors[selectedTicket.priority]}>{priorityLabels[selectedTicket.priority]}</Badge>
                <Badge variant={statusColors[selectedTicket.status]}>{statusLabels[selectedTicket.status]}</Badge>
              </div>
              {canManageTickets() && (
                <div className={styles.detailActions}>
                  <Select options={activeAgents.map(a => ({ value: a.id, label: `${a.lastName} ${a.firstName}` }))} value={selectedTicket.assignedAgentId || ''} onChange={(e) => handleAssign(selectedTicket.id, e.target.value)} />
                  <Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} value={selectedTicket.status} onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)} />
                </div>
              )}
            </div>
            <div className={styles.detailInfo}>
              <p><strong>Клиент:</strong> {selectedTicket.customerName} ({selectedTicket.customerEmail})</p>
              <p><strong>Категория:</strong> {getCategoryById(selectedTicket.categoryId)?.name}</p>
              <p><strong>Создан:</strong> {formatDate(selectedTicket.createdAt)}</p>
            </div>
            <div className={styles.detailDescription}><h4>Описание</h4><p>{selectedTicket.description}</p></div>
            <div className={styles.messages}>
              <h4>Сообщения ({getMessagesForTicket(selectedTicket.id).length})</h4>
              {getMessagesForTicket(selectedTicket.id).map(msg => (
                <div key={msg.id} className={`${styles.message} ${msg.senderType === 'agent' ? styles.agentMessage : styles.customerMessage}`}>
                  <div className={styles.messageHeader}><strong>{msg.senderName}</strong><span>{formatDate(msg.createdAt)}</span></div>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
            <div className={styles.replyForm}>
              <Input placeholder="Написать ответ..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <Button variant="primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>Отправить</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});
