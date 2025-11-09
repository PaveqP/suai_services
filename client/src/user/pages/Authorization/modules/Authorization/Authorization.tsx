import { useState } from "react"
import { Button, Input } from "../../../../../shared"
import s from './Authorization.module.scss'
import { useSignInMutation } from "../../../../services/authApi"

const Authorization = () => {

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const [signIn, {isLoading: loginInProgress, error: loginError}] = useSignInMutation()

    const submitLoginForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(email, password)
        signIn({
          email,
          password
        })
    }

  return (
    <div className={s.authModule}>
      <form onSubmit={submitLoginForm} className={s.authForm}>
        <Input placeholder="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
        <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Input>
        <Button type="submit" disabled={loginInProgress}>OK</Button>
      </form>
      {
        loginError && (
          <div>
            Login error
          </div>
        )
      }
    </div>
  )
}

export {Authorization}