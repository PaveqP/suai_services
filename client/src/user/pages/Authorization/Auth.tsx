import { useState } from "react"
import { Button } from "../../../shared"
import { Authorization, Registration } from "./modules"
import s from "./Auth.module.scss"

const Auth = () => {

    const [isRegistartion, setIsRegistration] = useState<boolean>(true)

  return (
    <section className={s.authSection}>
        <div className={s.authNavigation}>
            <Button variant={isRegistartion ? "primary" : "secondary"} onClick={() => setIsRegistration(true)}>Зарегистрироваться</Button>
            <Button variant={isRegistartion ? "secondary" : "primary"} onClick={() => setIsRegistration(false)}>Войти</Button>
        </div>
        {
            isRegistartion ? <Registration/> : <Authorization/>
        } 
    </section>
  )
}

export {Auth}