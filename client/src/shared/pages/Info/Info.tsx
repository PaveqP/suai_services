import { Header } from "./ui/Header"
import s from "./Info.module.scss"
import { Button } from "../../components"

const Info = () => {
  return (
    <div>
      <Header></Header>
      <div className={s.Wrapper}>
        <div className={s.InfoPanel}>
          <h1>Для пользователя</h1>
          <div className={s.InfoCard}>
            <div className={s.InfoText}>
              <ul className={s.TextPoints}>
                <li>1. Зарегистрируйтесь и управляйте поездками в личном кабинете</li>
                <li>2. Выбирайте класс обслуживания, который вам подходит</li>
                <li>3. Добавляйте опции поездки с ребенком или питомцем</li>
                <li>4. Решайте спорные моменты чеоез службу поддержки</li>
              </ul>
              <div className={s.ServiceClasses}>
                <h1>Классы обслуживания:</h1>
                <ul className={s.ServiceClassesList}>
                  <li><Button>Эконом</Button></li>
                  <li><Button>Комфорт</Button></li>
                  <li><Button>Бизнес</Button></li>
                </ul>
              </div>
            </div>
            <div className={s.InfoImage}>
              <img src="../../../../public/assets/User_Main.png" alt="*" />
            </div>
          </div>
        </div>
        <div className={s.InfoPanel}>
          <h1>Для водителя</h1>
          <div className={s.InfoCard}>
            <div className={s.InfoText}>
              <ul className={s.TextPoints}>
                <li>1. Зарегистрируйтесь и получайте заказы</li>
                <li>2. Работайте, в собственном графике и управляйте сменами</li>
                <li>3. Берите заказы, которые кажутся интересными</li>
                <li>4. Решайте спорные моменты чеоез службу поддержки</li>
              </ul>
              <div className={s.ServiceClasses}>
                <h1>Классы обслуживания:</h1>
                <ul className={s.ServiceClassesList}>
                  <li><Button>Эконом</Button></li>
                  <li><Button>Комфорт</Button></li>
                  <li><Button>Бизнес</Button></li>
                </ul>
              </div>
            </div>
            <div className={s.InfoImage}>
              <img src="../../../../public/assets/DriverMain.png" alt="*" />
            </div>
          </div>
        </div>
      </div>
      <footer className={s.Footer}>
        <p>ООО "Служба такси"</p>
        <p>© taxiservice 2025</p>
      </footer>
    </div>
  )
}

export {Info}