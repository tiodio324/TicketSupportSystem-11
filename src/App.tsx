import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { navigationStore, dataStore } from '@/store';
import { MainLayout, LoginModal, ConfirmModal, Toast } from '@/components';
import { HomePage, TicketsPage, AgentsPage, CustomersPage, AdminPage } from '@/pages';

const PageRouter = observer(() => {
  const { currentPage } = navigationStore;

  switch (currentPage) {
    case 'home': return <HomePage />;
    case 'tickets': return <TicketsPage />;
    case 'agents': return <AgentsPage />;
    case 'customers': return <CustomersPage />;
    case 'admin':
    case 'admin-tickets':
    case 'admin-agents': return <AdminPage />;
    default: return <HomePage />;
  }
});

const App = observer(() => {
  useEffect(() => { dataStore.loadAllData(); }, []);

  return (
    <>
      <MainLayout><PageRouter /></MainLayout>
      <LoginModal />
      <ConfirmModal />
      <Toast />
    </>
  );
});

export default App;
