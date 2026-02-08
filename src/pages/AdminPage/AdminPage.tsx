import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Agent, Category, AgentFormData, CategoryFormData } from '@/types';
import styles from './AdminPage.module.scss';

type AdminTab = 'agents' | 'categories';

export const AdminPage = observer(() => {
  const { agents, categories, createAgent, deleteAgent, createCategory, deleteCategory, loadAllData, agentsLoading, categoriesLoading } = dataStore;
  const [activeTab, setActiveTab] = useState<AdminTab>('agents');
  const [modalOpen, setModalOpen] = useState(false);
  const [agentForm, setAgentForm] = useState<AgentFormData>({ firstName: '', lastName: '', email: '', department: '' });
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', description: '', color: '#2874A6' });

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const resetForms = () => { setAgentForm({ firstName: '', lastName: '', email: '', department: '' }); setCategoryForm({ name: '', description: '', color: '#2874A6' }); };
  const openCreateModal = () => { resetForms(); setModalOpen(true); };

  const handleSave = async () => {
    if (activeTab === 'agents') {
      if (!agentForm.firstName || !agentForm.lastName || !agentForm.email) { uiStore.showError('Заполните обязательные поля'); return; }
      await createAgent(agentForm);
    } else {
      if (!categoryForm.name) { uiStore.showError('Введите название категории'); return; }
      await createCategory(categoryForm);
    }
    uiStore.showSuccess('Запись добавлена');
    setModalOpen(false);
    resetForms();
  };

  const handleDelete = async (id: string) => { uiStore.showConfirm('Удаление', 'Вы уверены?', async () => { if (activeTab === 'agents') await deleteAgent(id); else await deleteCategory(id); uiStore.showSuccess('Запись удалена'); }); };

  const agentColumns: TableColumn<Agent>[] = [
    { key: 'lastName', title: 'Фамилия' },
    { key: 'firstName', title: 'Имя' },
    { key: 'email', title: 'Email' },
    { key: 'department', title: 'Отдел' },
    { key: 'assignedTicketsCount', title: 'В работе', width: '80px' },
    { key: 'actions', title: '', width: '80px', render: (_: unknown, row: Agent) => (
      <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
      </Button>
    )},
  ];

  const categoryColumns: TableColumn<Category>[] = [
    { key: 'name', title: 'Название' },
    { key: 'description', title: 'Описание' },
    { key: 'color', title: 'Цвет', width: '80px', render: (v: unknown) => <div style={{ width: 24, height: 24, borderRadius: 4, background: v as string }} /> },
    { key: 'actions', title: '', width: '80px', render: (_: unknown, row: Category) => (
      <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
      </Button>
    )},
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>Управление</h1><p className={styles.subtitle}>Администрирование системы</p></div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'agents' ? styles.active : ''}`} onClick={() => setActiveTab('agents')}>Агенты</button>
        <button className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`} onClick={() => setActiveTab('categories')}>Категории</button>
      </div>
      <Card className={styles.toolbar}><Button variant="primary" onClick={openCreateModal}>Добавить {activeTab === 'agents' ? 'агента' : 'категорию'}</Button></Card>
      <Card padding="none">
        {activeTab === 'agents' && <Table columns={agentColumns} data={agents.filter(a => a.isActive)} keyField="id" loading={agentsLoading} emptyText="Нет агентов" />}
        {activeTab === 'categories' && <Table columns={categoryColumns} data={categories.filter(c => c.isActive)} keyField="id" loading={categoriesLoading} emptyText="Нет категорий" />}
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Добавить ${activeTab === 'agents' ? 'агента' : 'категорию'}`}
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Добавить</Button></div>}>
        <div className={styles.form}>
          {activeTab === 'agents' && (<>
            <Input label="Фамилия *" value={agentForm.lastName} onChange={(e) => setAgentForm({ ...agentForm, lastName: e.target.value })} />
            <Input label="Имя *" value={agentForm.firstName} onChange={(e) => setAgentForm({ ...agentForm, firstName: e.target.value })} />
            <Input label="Email *" type="email" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })} />
            <Input label="Отдел" value={agentForm.department} onChange={(e) => setAgentForm({ ...agentForm, department: e.target.value })} />
          </>)}
          {activeTab === 'categories' && (<>
            <Input label="Название *" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            <Input label="Описание" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            <Input label="Цвет" type="color" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} />
          </>)}
        </div>
      </Modal>
    </div>
  );
});
