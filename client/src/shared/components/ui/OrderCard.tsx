import type { FC } from "react"
import type { OrdersListResponse } from "../../../user/data-access"
import s from './OrderCard.module.scss'

type OrderCardPropsType = {
    cardData: OrdersListResponse
}

const OrderCard: FC<OrderCardPropsType> = ({ cardData }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'completed': '#22c55e',
      'active': '#3b82f6',
      'pending': '#f59e0b',
      'cancelled': '#ef4444',
    }
    return statusColors[status] || '#6b7280'
  }

  return (
    <div className={s.Wrapper}>
      <div>
        <div className={s.Header}>
            <div className={s.Category}>
            <span className={s.CategoryIcon}>🚗</span>
            {cardData.service_category}
            </div>
            <div 
            className={s.Status} 
            style={{ backgroundColor: getStatusColor(cardData.status) }}
            >
            {cardData.status}
            </div>
        </div>

        <div className={s.Route}>
            <div className={s.RoutePoint}>
            <div className={s.PointMarker}></div>
            <div className={s.PointInfo}>
                <div className={s.PointAddress}>
                {cardData.start_trip_street}, {cardData.start_trip_house}
                {cardData.start_trip_build && `, ${cardData.start_trip_build}`}
                </div>
                <div className={s.PointCity}>{cardData.city}</div>
            </div>
            </div>
            
            <div className={s.RouteDivider}></div>
            
            <div className={s.RoutePoint}>
            <div className={`${s.PointMarker} ${s.Destination}`}></div>
            <div className={s.PointInfo}>
                <div className={s.PointAddress}>
                {cardData.destination_street}, {cardData.destination_house}
                {cardData.destination_build && `, ${cardData.destination_build}`}
                </div>
                <div className={s.PointCity}>{cardData.city}</div>
            </div>
            </div>
        </div>

        {cardData.Car && cardData.driver_name && (
            <div className={s.DriverInfo}>
                <div className={s.CarIcon}>🚘</div>
                <div className={s.CarDetails}>
                    <div className={s.CarModel}>
                    {cardData.Car.brand} {cardData.Car.model} <br/>
                    {cardData.Car.number}
                    </div>
                </div>
            </div>
        )}

        {(cardData.options?.child || cardData.options?.pet) && (
            <div className={s.Options}>
            {cardData.options?.child && (
                <div className={s.Option}>
                <span className={s.OptionIcon}>👶</span>
                Детское кресло
                </div>
            )}
            {cardData.options?.pet && (
                <div className={s.Option}>
                <span className={s.OptionIcon}>🐕</span>
                Перевозка животных
                </div>
            )}
            </div>
        )}
      </div>

      <div className={s.PriceSection}>
        <div className={s.Price}>{formatPrice(Number(cardData.price))}</div>
      </div>
    </div>
  )
}

export { OrderCard }