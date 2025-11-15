import type { FC } from "react"
import type { UserInfoResponse } from "../../../../data-access"
import s from './Personal.module.scss'
import { APP_ROUTES, Button } from "../../../../../shared"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../../../../store/store"
import { logout } from "../../../../../store/slices/authSlice"

type PersonalPropsType = {
    personalInfo: UserInfoResponse
}

const Personal: FC<PersonalPropsType> = ({ personalInfo }) => {

    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    
    const Logout = () => {
        dispatch(logout())
        navigate(APP_ROUTES.userAuth)
    }
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
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
              <span className={s.InfoLabel}>Страна</span>
              <span className={s.InfoValue}>{personalInfo.country || "-"}</span>
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Город</span>
              <span className={s.InfoValue}>{personalInfo.city || "-"}</span>
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Дата рождения</span>
              <span className={s.InfoValue}>{formatDate(personalInfo.date_of_birth)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.Actions}>
        <Button variant="primary" onClick={() => handleNavigate(APP_ROUTES.userPersonal)} className={s.EditButton}>
          ✏️ Перейти в профиль
        </Button>
        <Button variant="secondary" className={s.LogoutButton} onClick={() => Logout()}>
          🚪 Выйти из аккаунта
        </Button>
      </div>
    </section>
  )
}

export { Personal }