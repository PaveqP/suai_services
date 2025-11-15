import { useNavigate } from "react-router-dom";
import { Button, Loader, ErrorMessage, APP_ROUTES } from "../../../shared";
import { 
  useGetInfoQuery, 
  useGetOrdersQuery, 
  useGetActiveShiftQuery, 
  useStartShiftMutation, 
  useEndShiftMutation,
  useAcceptOrderMutation,
  useStartTripMutation,
  useCompleteOrderMutation
} from "../../services/driverApi";
import { DriverPersonal } from "./ui/Personal/DriverPersonal";
import s from './DriverAccount.module.scss';

const DriverAccount = () => {
  const navigate = useNavigate();

  const { 
    data: driverInfo, 
    isLoading: infoLoading, 
    error: infoError 
  } = useGetInfoQuery();

  const { 
    data: orders, 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders
  } = useGetOrdersQuery();

  const {
    data: activeShift,
    isLoading: shiftLoading,
    refetch: refetchShift
  } = useGetActiveShiftQuery();

  const [startShift, { isLoading: isStartingShift }] = useStartShiftMutation();
  const [endShift, { isLoading: isEndingShift }] = useEndShiftMutation();

  const handleStartShift = async () => {
    try {
      await startShift().unwrap();
      refetchShift();
      refetchOrders();
    } catch (error) {
      console.error("Ошибка начала смены:", error);
    }
  };

  const handleEndShift = async () => {
    try {
      await endShift().unwrap();
      refetchShift();
      refetchOrders();
    } catch (error) {
      console.error("Ошибка окончания смены:", error);
    }
  };

  if (infoLoading || ordersLoading || shiftLoading) {
    return (
      <div className={s.LoadingContainer}>
        <Loader size="large" />
        <p>Загружаем ваши данные...</p>
      </div>
    );
  }

  if (infoError) {
    return (
      <ErrorMessage 
        title="Ошибка загрузки данных"
        message="Не удалось загрузить информацию о профиле"
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (ordersError) {
    return (
      <ErrorMessage 
        title="Ошибка загрузки заказов"
        message="Не удалось загрузить заказы"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className={s.Container}>
      <aside className={s.Sidebar}>
        {driverInfo && <DriverPersonal personalInfo={driverInfo} />}
      </aside>

      <main className={s.MainContent}>
        <header className={s.Header}>
          <div className={s.HeaderContent}>
            <div className={s.TitleSection}>
              <h1 className={s.Title}>Обработка заказов</h1>
              <p className={s.Subtitle}>
                {orders?.length ? `Доступно заказов: ${orders.length}` : 'Нет доступных заказов'}
              </p>
            </div>
            
            <div className={s.Actions}>
              <Button 
                variant="primary" 
                className={s.ProfileButton}
                onClick={() => navigate(APP_ROUTES.driverPersonal)}
              >
                Профиль
              </Button>
            </div>
          </div>
        </header>

        <section className={s.ShiftSection}>
          <div className={s.ShiftCard}>
            <h2 className={s.ShiftTitle}>Рабочая смена</h2>
            {activeShift ? (
              <div className={s.ActiveShift}>
                <div className={s.ShiftStatus}>
                  <span className={s.StatusBadge}>Активна</span>
                  <span className={s.ShiftTime}>
                    Начало: {new Date(activeShift.start_time).toLocaleString('ru-RU')}
                  </span>
                </div>
                <div className={s.ShiftStats}>
                  <div className={s.StatItem}>
                    <span className={s.StatLabel}>Заказов выполнено:</span>
                    <span className={s.StatValue}>{activeShift.total_orders || 0}</span>
                  </div>
                  <div className={s.StatItem}>
                    <span className={s.StatLabel}>Заработок:</span>
                    <span className={s.StatValue}>
                      {activeShift.total_earnings 
                        ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(activeShift.total_earnings)
                        : '0 ₽'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={handleEndShift}
                  disabled={isEndingShift}
                  className={s.EndShiftButton}
                >
                  {isEndingShift ? "Завершение..." : "Завершить смену"}
                </Button>
              </div>
            ) : (
              <div className={s.InactiveShift}>
                <p className={s.ShiftMessage}>Смена не активна</p>
                <Button
                  variant="primary"
                  onClick={handleStartShift}
                  disabled={isStartingShift}
                  className={s.StartShiftButton}
                >
                  {isStartingShift ? "Запуск..." : "Начать смену"}
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className={s.OrdersSection}>
          {orders && orders.length > 0 ? (
            <div className={s.OrdersList}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdate={refetchOrders} />
              ))}
            </div>
          ) : (
            <div className={s.EmptyState}>
              <div className={s.EmptyIcon}>📦</div>
              <h3>Заказов пока нет</h3>
              <p>Новые заказы появятся здесь, когда начнется смена</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const OrderCard = ({ order, onUpdate }: { order: any; onUpdate: () => void }) => {
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [startTrip, { isLoading: isStartingTrip }] = useStartTripMutation();
  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();

  const handleAccept = async () => {
    try {
      await acceptOrder(order.id).unwrap();
      onUpdate();
    } catch (error) {
      console.error("Ошибка принятия заказа:", error);
    }
  };

  const handleStartTrip = async () => {
    try {
      await startTrip(order.id).unwrap();
      onUpdate();
    } catch (error) {
      console.error("Ошибка начала поездки:", error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOrder(order.id).unwrap();
      onUpdate();
    } catch (error) {
      console.error("Ошибка завершения заказа:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'accepted': '#3b82f6',
      'in_progress': '#8b5cf6',
      'completed': '#22c55e',
      'cancelled': '#ef4444',
    };
    return statusColors[status] || '#6b7280';
  };

  return (
    <div className={s.OrderCard}>
      <div className={s.OrderHeader}>
        <div className={s.OrderCategory}>
          <span className={s.CategoryIcon}>🚗</span>
          {order.service_category}
        </div>
        <div 
          className={s.OrderStatus} 
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {order.status}
        </div>
      </div>

      <div className={s.OrderRoute}>
        <div className={s.RoutePoint}>
          <div className={s.PointMarker}></div>
          <div className={s.PointInfo}>
            <div className={s.PointAddress}>
              {order.start_trip_street}, {order.start_trip_house}
              {order.start_trip_build && `, ${order.start_trip_build}`}
            </div>
            <div className={s.PointCity}>{order.city}</div>
          </div>
        </div>
        
        <div className={s.RouteDivider}></div>
        
        <div className={s.RoutePoint}>
          <div className={`${s.PointMarker} ${s.Destination}`}></div>
          <div className={s.PointInfo}>
            <div className={s.PointAddress}>
              {order.destination_street}, {order.destination_house}
              {order.destination_build && `, ${order.destination_build}`}
            </div>
            <div className={s.PointCity}>{order.city}</div>
          </div>
        </div>
      </div>

      {(order.options?.child || order.options?.pet) && (
        <div className={s.OrderOptions}>
          {order.options?.child && (
            <div className={s.Option}>
              <span className={s.OptionIcon}>👶</span>
              Детское кресло
            </div>
          )}
          {order.options?.pet && (
            <div className={s.Option}>
              <span className={s.OptionIcon}>🐕</span>
              Перевозка животных
            </div>
          )}
        </div>
      )}

      <div className={s.OrderFooter}>
        <div className={s.OrderPrice}>
          {new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
          }).format(order.price)}
        </div>
        <div className={s.OrderActions}>
          {(order.status === 'pending' || order.status === 'Created') && (
            <Button
              variant="primary"
              onClick={handleAccept}
              disabled={isAccepting}
              className={s.AcceptButton}
            >
              {isAccepting ? "Принятие..." : "Принять заказ"}
            </Button>
          )}
          {order.status === 'accepted' && (
            <Button
              variant="primary"
              onClick={handleStartTrip}
              disabled={isStartingTrip}
              className={s.StartTripButton}
            >
              {isStartingTrip ? "Запуск..." : "Начать поездку"}
            </Button>
          )}
          {(order.status === 'in_progress' || order.status === 'accepted') && (
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={isCompleting}
              className={s.CompleteButton}
            >
              {isCompleting ? "Завершение..." : "Завершить заказ"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export { DriverAccount };
