import { useState } from "react"
import { Button, Input } from "../../../shared"
import s from './DriverAuth.module.scss'
import { useSignInMutation } from "../../services/driverAuthApi"
import { useNavigate } from "react-router-dom"
import { APP_ROUTES } from "../../../shared/data-access/constants/routes"

const DriverAuth = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const [signIn, {isLoading: loginInProgress, error: loginError}] = useSignInMutation()
  const navigate = useNavigate()

  const submitLoginForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await signIn({
        email,
        password
      }).unwrap()
      navigate(APP_ROUTES.driverAccount)
    } catch (error) {
      console.error("Ошибка входа:", error)
    }
  }

  return (
    <section className={s.authSection}>
      <div className={s.authModule}>
        <h1 className={s.title}>Вход для водителя</h1>
        <form onSubmit={submitLoginForm} className={s.authForm}>
          <Input placeholder="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
          <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Input>
          <Button type="submit" disabled={loginInProgress}>Войти</Button>
        </form>
        {
          loginError && (
            <div className={s.error}>
              Ошибка входа
            </div>
          )
        }
      </div>
    </section>
  )
}

export { DriverAuth }

