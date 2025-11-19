import { useNavigate } from "react-router-dom"
import { APP_ROUTES, Button } from "../../.."
import s from './Header.module.scss'

const Header = () => {

  const navigate = useNavigate()

  const handleNavigate = (url: string) => {
    navigate(url)
  }

  return (
    <nav>
      <div className={s.navContainer}>
        <h1>Служба такси</h1>
        <div className={s.Actions}>
          <Button onClick={() => handleNavigate(APP_ROUTES.driverAuth)}>Стать водителем</Button>
          <Button onClick={() => handleNavigate(APP_ROUTES.userAuth)}>Войти</Button>
          <Button onClick={() => handleNavigate(APP_ROUTES.userAuth)}>Зaрегистрироваться</Button>
        </div>
      </div>
    </nav>
  )
}

export {Header}