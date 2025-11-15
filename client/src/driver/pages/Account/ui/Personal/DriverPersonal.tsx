import type { FC } from "react"
import type { DriverInfoResponse } from "../../../../data-access"
import s from './DriverPersonal.module.scss'
import { APP_ROUTES, Button } from "../../../../../shared"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../../../../store/store"
import { logout } from "../../../../../store/slices/authSlice"

type DriverPersonalPropsType = {
    personalInfo: DriverInfoResponse
}

const DriverPersonal: FC<DriverPersonalPropsType> = ({ personalInfo }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  
  const Logout = () => {
    dispatch(logout())
    navigate(APP_ROUTES.driverAuth)
  }

  const handleNavigate = (url: string) => {
    navigate(url)
  }

  return (
    <section className={s.Wrapper}>
      <div className={s.Header}>
        <h1 className={s.Title}>Личный кабинет</h1>
        <div className={s.Avatar}>
          {personalInfo.name?.[0]}{personalInfo.surname?.[0]}
        </div>
      </div>

      <div className={s.Content}>
        <div className={s.InfoCard}>          
          <div className={s.InfoGrid}>
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Имя</span>
              <span className={s.InfoValue}>{personalInfo.name || "-"}</span>
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Фамилия</span>
              <span className={s.InfoValue}>{personalInfo.surname || "-"}</span>
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Отчество</span>
              <span className={s.InfoValue}>{personalInfo.lastname || "-"}</span>
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Email</span>
              <span className={s.InfoValue}>{personalInfo.email || "-"}</span>
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Телефон</span>
              <span className={s.InfoValue}>{personalInfo.phone_number || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.Actions}>
        <Button variant="primary" onClick={() => handleNavigate(APP_ROUTES.driverPersonal)} className={s.EditButton}>
          ✏️ Перейти в профиль
        </Button>
        <Button variant="secondary" className={s.LogoutButton} onClick={() => Logout()}>
          🚪 Выйти из аккаунта
        </Button>
      </div>
    </section>
  )
}

export { DriverPersonal }

