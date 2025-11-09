import { useState } from "react"
import { Button, Input } from "../../../../../shared"
import s from './Registration.module.scss'
import { useSignUpMutation } from "../../../../services/authApi"

const Registration = () => {

    const [name, setName] = useState<string>('')
    const [surname, setSurname] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [phoneNumber, setPhoneNumber] = useState<string>('')

    const [signUp, {isLoading: isRegistering, error: registerError}] = useSignUpMutation()

    const submitRegForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(name, surname, email, password, phoneNumber)
        signUp({
          name,
          surname,
          email,
          password,
          phone_number: phoneNumber
        })
    }

  return (
    <div className={s.regModule}>
      <form onSubmit={submitRegForm} className={s.regForm}>
        <Input placeholder="name" value={name} onChange={(e) => setName(e.target.value)}></Input>
        <Input placeholder="surname" value={surname} onChange={(e) => setSurname(e.target.value)}></Input>
        <Input placeholder="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></Input>
        <Input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Input>
        <Input placeholder="phone_number" type="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}></Input>
        <Button type="submit" disabled={isRegistering}>OK</Button>
      </form>
      {
        registerError && (
          <div>
            Registartion failed
          </div>
        )
      }
    </div>
  )
}

export {Registration}