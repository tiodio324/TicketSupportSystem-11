import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { Card, Button, Modal, Input } from '@/components/UI';
import type { AgentFormData } from '@/types';
import styles from './AgentsPage.module.scss';

export const AgentsPage = observer(() => {
  const { activeAgents, createAgent, deleteAgent, loadAllData, agentsLoading } = dataStore;
  const { canManageAgents } = authStore;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AgentFormData>({ firstName: '', lastName: '', email: '', department: '' });

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const openCreateModal = () => { setForm({ firstName: '', lastName: '', email: '', department: '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) { uiStore.showError('Заполните обязательные поля'); return; }
    await createAgent(form);
    uiStore.showSuccess('Агент добавлен');
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление агента', 'Вы уверены?', async () => { await deleteAgent(id); uiStore.showSuccess('Агент удалён'); });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className={styles.title}>Агенты</h1><p className={styles.subtitle}>Команда поддержки</p></div>
        {canManageAgents() && <Button variant="primary" onClick={openCreateModal}>Добавить агента</Button>}
      </div>

      {agentsLoading ? <Card className={styles.loading}>Загрузка...</Card> : activeAgents.length === 0 ? <Card className={styles.empty}>Агенты не найдены</Card> : (
        <div className={styles.agentsGrid}>
          {activeAgents.map(agent => (
            <Card key={agent.id} className={styles.agentCard}>
              <div className={styles.agentAvatar}>
                <div className={styles.avatarPlaceholder}>{agent.lastName[0]}{agent.firstName[0]}</div>
                <span className={`${styles.statusDot} ${agent.isOnline ? styles.online : styles.offline}`} />
              </div>
              <div className={styles.agentInfo}>
                <h3>{agent.lastName} {agent.firstName}</h3>
                <p className={styles.department}>{agent.department}</p>
                <p className={styles.email}>{agent.email}</p>
              </div>
              <div className={styles.agentStats}>
                <div className={styles.stat}><span className={styles.statValue}>{agent.assignedTicketsCount}</span><span className={styles.statLabel}>В работе</span></div>
                <div className={styles.stat}><span className={styles.statValue}>{agent.resolvedTicketsCount}</span><span className={styles.statLabel}>Решено</span></div>
              </div>
              {canManageAgents() && (
                <div className={styles.agentActions}>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(agent.id)}>Удалить</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Добавить агента"
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Добавить</Button></div>}>
        <div className={styles.form}>
          <Input label="Фамилия *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Input label="Имя *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Отдел" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
});
