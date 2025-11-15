import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DrivesList } from "../../../shared/modules"
import { useGetInfoQuery, useGetOrdersQuery } from "../../services/userApi";
import { Personal } from "./ui/Personal/Personal";
import { setUserInfo, setUserOrders } from "../../../store/slices/userSlice";
import { useAppDispatch } from "../../../store/store";
import s from './Account.module.scss'
import { Button, Loader, ErrorMessage, APP_ROUTES } from "../../../shared";

const Account = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const { 
        data: userInfo, 
        isLoading: infoLoading, 
        error: infoError 
    } = useGetInfoQuery()

    const { 
        data: orders, 
        isLoading: ordersLoading, 
        error: ordersError 
    } = useGetOrdersQuery()

    useEffect(() => {
        if (userInfo) {
            dispatch(setUserInfo(userInfo))
        }
    }, [userInfo, dispatch])

    useEffect(() => {
        if (orders) {
            dispatch(setUserOrders(orders))
        }
    }, [orders, dispatch])

    if (infoLoading || ordersLoading) {
        return (
            <div className={s.LoadingContainer}>
                <Loader size="large" />
                <p>Загружаем ваши данные...</p>
            </div>
        )
    }

    if (infoError) {
        return (
            <ErrorMessage 
                title="Ошибка загрузки данных"
                message="Не удалось загрузить информацию о профиле"
                onRetry={() => window.location.reload()}
            />
        )
    }

    if (ordersError) {
        return (
            <ErrorMessage 
                title="Ошибка загрузки заказов"
                message="Не удалось загрузить историю заказов"
                onRetry={() => window.location.reload()}
            />
        )
    }

    return (
        <div className={s.Container}>
            <aside className={s.Sidebar}>
                {userInfo && <Personal personalInfo={userInfo} />}
            </aside>

            <main className={s.MainContent}>
                <header className={s.Header}>
                    <div className={s.HeaderContent}>
                        <div className={s.TitleSection}>
                            <h1 className={s.Title}>История заказов</h1>
                            <p className={s.Subtitle}>
                                {orders?.length ? `Всего заказов: ${orders.length}` : 'У вас пока нет заказов'}
                            </p>
                        </div>
                        
                        <div className={s.Actions}>
                            <Button 
                                variant="primary" 
                                className={s.CreateOrderButton}
                                onClick={() => navigate(APP_ROUTES.userOrderManager)}
                            >
                                Создать заказ
                            </Button>
                            <Button 
                                variant="secondary" 
                                className={s.SupportButton}
                                onClick={() => navigate(APP_ROUTES.userTicketManager)}
                            >
                                Обратиться в поддержку
                            </Button>
                        </div>
                    </div>
                </header>

                <section className={s.OrdersSection}>
                    {orders && orders.length > 0 ? (
                        <DrivesList drives={orders} />
                    ) : (
                        <div className={s.EmptyState}>
                            <div className={s.EmptyIcon}>🚗</div>
                            <h3>Заказов пока нет</h3>
                            <p>Создайте ваш первый заказ такси</p>
                            <Button 
                                variant="primary" 
                                className={s.EmptyAction}
                                onClick={() => navigate(APP_ROUTES.userOrderManager)}
                            >
                                Создать первый заказ
                            </Button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export { Account }