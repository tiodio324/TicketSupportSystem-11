import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore } from '@/store';
import { Card, Badge } from '@/components/UI';
import styles from './CustomersPage.module.scss';

export const CustomersPage = observer(() => {
  const { activeTickets, loadAllData, ticketsLoading } = dataStore;

  useEffect(() => { loadAllData(); }, [loadAllData]);

  // Extract unique customers from tickets
  const customers = activeTickets.reduce((acc, ticket) => {
    if (!acc.find(c => c.email === ticket.customerEmail)) {
      acc.push({
        id: ticket.customerId,
        name: ticket.customerName,
        email: ticket.customerEmail,
        ticketsCount: activeTickets.filter(t => t.customerEmail === ticket.customerEmail).length,
        openTickets: activeTickets.filter(t => t.customerEmail === ticket.customerEmail && (t.status === 'open' || t.status === 'in_progress')).length,
      });
    }
    return acc;
  }, [] as { id: string; name: string; email: string; ticketsCount: number; openTickets: number; }[]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Клиенты</h1>
        <p className={styles.subtitle}>База клиентов системы поддержки</p>
      </div>

      {ticketsLoading ? <Card className={styles.loading}>Загрузка...</Card> : customers.length === 0 ? <Card className={styles.empty}>Клиенты не найдены</Card> : (
        <div className={styles.customersGrid}>
          {customers.map(customer => (
            <Card key={customer.id} className={styles.customerCard}>
              <div className={styles.customerAvatar}>
                <div className={styles.avatarPlaceholder}>{customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
              </div>
              <div className={styles.customerInfo}>
                <h3>{customer.name}</h3>
                <p className={styles.email}>{customer.email}</p>
              </div>
              <div className={styles.customerStats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{customer.ticketsCount}</span>
                  <span className={styles.statLabel}>Всего тикетов</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{customer.openTickets}</span>
                  <span className={styles.statLabel}>Открытых</span>
                </div>
              </div>
              {customer.openTickets > 0 && <Badge variant="warning">{customer.openTickets} открытых</Badge>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});
