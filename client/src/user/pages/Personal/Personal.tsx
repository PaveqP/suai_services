import { useNavigate } from 'react-router-dom'
import { APP_ROUTES, Button, ErrorMessage, Input, Loader } from '../../../shared'
import { logout } from '../../../store/slices/authSlice'
import { useAppDispatch } from '../../../store/store'
import { useGetInfoQuery, useUpdateInfoMutation } from '../../services/userApi'
import s from './Personal.module.scss'
import { useEffect, useState } from 'react'

type UserDataForm = {
    name: string,
    surname: string,
    lastname: string,
    country: string,
    city: string,
    dateOfBirth: string,
    phoneNumber: string,
    paymentInfo: PaymentInfo
} 

type PaymentInfo = {
    bankName: string,
    holderName: string,
    holderSurname: string,
    cardNumber: string,
    validUntilDate: string,
    cvv: string,
}

const Personal = () => {
    const { data: personalInfo, isLoading: infoLoading, error: infoError } = useGetInfoQuery()
    const [updateInfo] = useUpdateInfoMutation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const Logout = () => {
        dispatch(logout())
        navigate(APP_ROUTES.userAuth)
    }

    const GoMain = () => {
        navigate(APP_ROUTES.userAccount)
    }

    const [userData, setUserData] = useState<UserDataForm>({
        name: '',
        surname: '',
        lastname: '',
        country: '',
        city: '',
        dateOfBirth: '',
        phoneNumber: '',
        paymentInfo: {
            bankName: '',
            holderName: '',
            holderSurname: '',
            cardNumber: '',
            validUntilDate: '',
            cvv: '',
        }
    })

    useEffect(() => {
        if (personalInfo) {
            setUserData({
                name: personalInfo.name || '',
                surname: personalInfo.surname || '',
                lastname: personalInfo.lastname || '',
                country: personalInfo.country || '',
                city: personalInfo.city || '',
                dateOfBirth: personalInfo.date_of_birth || '',
                phoneNumber: personalInfo.phone_number || '',
                paymentInfo: {
                    bankName: 'Альфа банк',
                    holderName: 'Павел',
                    holderSurname: 'Черепов',
                    cardNumber: '5432 6729 8712 8245',
                    validUntilDate: '23.03.2028',
                    cvv: "***",
                }
            })
        }
    }, [personalInfo])

    const [isPersonalEditing, setIsPersonalEditing] = useState<boolean>(false)
    const [isContactEditing, setIsContactEditing] = useState<boolean>(false)
    const [isPaymentEditing, setIsPaymentEditing] = useState<boolean>(false)

    const handleEditPersonalInfo = () => {
        setIsPersonalEditing(true)
    }

    const handleEditContactInfo = () => {
        setIsContactEditing(true)
    }

    const handleEditPaymentInfo = () => {
        setIsPaymentEditing(true)
    }

    const handleChangePersonalInfo = (value: string, parameter: keyof UserDataForm) => {
        setUserData(prev => ({
            ...prev,
            [parameter]: value
        }))
    }

    const handleChangePaymentInfo = (value: string, parameter: keyof PaymentInfo) => {
        setUserData(prev => ({
            ...prev,
            paymentInfo: {
                ...prev.paymentInfo,
                [parameter]: value
            }
        }))
    }

    const savePersonalData = () => {
        console.log('Сохранение личных данных:', userData)
        updateInfo({
            name: userData.name,
            surname: userData.surname,
            lastname: userData.lastname,
            country: userData.country,
            city: userData.city,
            date_of_birth: userData.dateOfBirth,
        })
        setIsPersonalEditing(false)
    }

    const saveContactData = () => {
        console.log('Сохранение контактных данных:', userData)
        updateInfo({
            phone_number: userData.phoneNumber
        })
        setIsContactEditing(false)
    }

    const savePaymentData = () => {
        console.log('Сохранение платежных данных:', userData.paymentInfo)
        setIsPaymentEditing(false)
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

    const formatCardNumber = (cardNumber: string) => {
        if (!cardNumber) return "-"
        return cardNumber.replace(/(\d{4})/g, '$1 ').trim()
    }

    if (infoLoading) {
        return (
            <div className={s.LoadingContainer}>
                <Loader size="large" />
                <p>Загружаем ваши данные...</p>
            </div>
        )
    }

    if (!personalInfo || infoError) {
        return (
            <ErrorMessage 
                title="Ошибка загрузки данных"
                message="Не удалось загрузить информацию о профиле"
                onRetry={() => window.location.reload()}
            />
        )
    }

    return (
        <section className={s.Wrapper}>
            <div className={s.Header}>
                <div className={s.Header}>
                    <Button className={s.LogoutButton} onClick={() => GoMain()}>
                        {"<-"} На главную
                    </Button>
                </div>
                <div className={s.Header}>
                    <h1 className={s.Title}>Личный кабинет</h1>
                    <div className={s.Avatar}>
                        {personalInfo.name?.[0]}{personalInfo.surname?.[0]}
                    </div>
                </div>
                <Button variant="secondary" className={s.LogoutButton} onClick={() => Logout()}>
                    🚪 Выйти из аккаунта
                </Button>
            </div>

            <div className={s.Content}>
                <div className={s.InfoCard}>
                    <h2 className={s.CardTitle}>Персональная информация</h2>
                    
                    <div className={s.InfoGrid}>
                        <div className={s.InfoItem}>
                            <span className={s.InfoLabel}>Имя</span>
                            {
                                isPersonalEditing ?
                                <Input value={userData.name} onChange={(e) => handleChangePersonalInfo(e.target.value, "name")}/> :
                                <span className={s.InfoValue}>{personalInfo.name || "-"}</span>
                            }
                        </div>
                        
                        <div className={s.InfoItem}>
                            <span className={s.InfoLabel}>Фамилия</span>
                            {
                                isPersonalEditing ?
                                <Input value={userData.surname} onChange={(e) => handleChangePersonalInfo(e.target.value, "surname")}/> :
                                <span className={s.InfoValue}>{personalInfo.surname || "-"}</span>
                            }
                        </div>
                        
                        <div className={s.InfoItem}>
                            <span className={s.InfoLabel}>Отчество</span>
                            {
                                isPersonalEditing ?
                                <Input value={userData.lastname} onChange={(e) => handleChangePersonalInfo(e.target.value, "lastname")}/> :
                                <span className={s.InfoValue}>{personalInfo.lastname || "-"}</span>
                            }
                        </div>
                        
                        <div className={s.InfoItem}>
                            <span className={s.InfoLabel}>Страна</span>
                            {
                                isPersonalEditing ?
                                <Input value={userData.country} onChange={(e) => handleChangePersonalInfo(e.target.value, "country")}/> :
                                <span className={s.InfoValue}>{personalInfo.country || "-"}</span>
                            }
                        </div>
                        
                        <div className={s.InfoItem}>
                            <span className={s.InfoLabel}>Город</span>
                            {
                                isPersonalEditing ?
                                <Input value={userData.city} onChange={(e) => handleChangePersonalInfo(e.target.value, "city")}/> :
                                <span className={s.InfoValue}>{personalInfo.city || "-"}</span>
                            }
                        </div>
                        
                        <div className={s.InfoItem}>
                            <span className={s.InfoLabel}>Дата рождения</span>
                            {
                                isPersonalEditing ?
                                <Input value={userData.dateOfBirth} onChange={(e) => handleChangePersonalInfo(e.target.value, "dateOfBirth")}/> :
                                <span className={s.InfoValue}>{formatDate(personalInfo.date_of_birth)}</span>
                            }
                        </div>
                        {
                            isPersonalEditing 
                            ?
                            <Button variant="primary" className={s.EditButton} onClick={savePersonalData}>
                                Сохранить
                            </Button>
                            :
                            <Button variant="primary" className={s.EditButton} onClick={handleEditPersonalInfo}>
                                ✏️ Редактировать данные
                            </Button>
                        }
                    </div>
                </div>

                <div className={s.InfoCard}>
                    <h2 className={s.CardTitle}>Контактная информация</h2>
                    
                    <div className={s.ContactInfo}>
                        <div className={s.ContactParams}>
                            <div className={s.ContactItem}>
                                <div className={s.ContactIcon}>📧</div>
                                <div className={s.ContactDetails}>
                                    <span className={s.ContactLabel}>Электронная почта</span>
                                    <span className={s.ContactValue}>{personalInfo.email}</span>
                                </div>
                            </div>
                            
                            <div className={s.ContactItem}>
                                <div className={s.ContactIcon}>📱</div>
                                <div className={s.ContactDetails}>
                                    <span className={s.ContactLabel}>Телефон</span>
                                    {
                                        isContactEditing ?
                                        <Input 
                                            value={userData.phoneNumber} 
                                            onChange={(e) => handleChangePersonalInfo(e.target.value, "phoneNumber")}
                                        /> :
                                        <span className={s.ContactValue}>{personalInfo.phone_number || "-"}</span>
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            isContactEditing 
                            ?
                            <Button variant="primary" className={s.EditButton} onClick={saveContactData}>
                                Сохранить
                            </Button>
                            :
                            <Button variant="primary" className={s.EditButton} onClick={handleEditContactInfo}>
                                ✏️ Редактировать данные
                            </Button>
                        }
                    </div>
                </div>

                <div className={s.InfoCard}>
                    <h2 className={s.CardTitle}>Платежная информация</h2>
                    
                    <div className={s.ContactInfo}>
                        <div className={s.InfoGrid}>
                            <div className={s.InfoItem}>
                                <div className={s.PaymentDetails}>
                                    <span className={s.PaymentLabel}>Банк</span>
                                    {
                                        isPaymentEditing ?
                                        <Input 
                                            value={userData.paymentInfo.bankName} 
                                            onChange={(e) => handleChangePaymentInfo(e.target.value, "bankName")}
                                        /> :
                                        <span className={s.PaymentValue}>{userData.paymentInfo.bankName || "-"}</span>
                                    }
                                </div>
                            </div>
                            
                            <div className={s.InfoItem}>
                                <div className={s.PaymentDetails}>
                                    <span className={s.PaymentLabel}>Имя владельца карты</span>
                                    {
                                        isPaymentEditing ?
                                        <Input 
                                            value={userData.paymentInfo.holderName} 
                                            onChange={(e) => handleChangePaymentInfo(e.target.value, "holderName")}
                                        /> :
                                        <span className={s.PaymentValue}>{userData.paymentInfo.holderName || "-"}</span>
                                    }
                                </div>
                            </div>

                            <div className={s.InfoItem}>
                                <div className={s.PaymentDetails}>
                                    <span className={s.PaymentLabel}>Фамилия владельца карты</span>
                                    {
                                        isPaymentEditing ?
                                        <Input 
                                            value={userData.paymentInfo.holderSurname} 
                                            onChange={(e) => handleChangePaymentInfo(e.target.value, "holderSurname")}
                                        /> :
                                        <span className={s.PaymentValue}>{userData.paymentInfo.holderSurname || "-"}</span>
                                    }
                                </div>
                            </div>

                            <div className={s.InfoItem}>
                                <div className={s.PaymentDetails}>
                                    <span className={s.PaymentLabel}>Номер карты</span>
                                    {
                                        isPaymentEditing ?
                                        <Input 
                                            value={userData.paymentInfo.cardNumber} 
                                            onChange={(e) => handleChangePaymentInfo(e.target.value, "cardNumber")}
                                            placeholder="XXXX XXXX XXXX XXXX"
                                        /> :
                                        <span className={s.PaymentValue}>{formatCardNumber(userData.paymentInfo.cardNumber)}</span>
                                    }
                                </div>
                            </div>

                            <div className={s.InfoItem}>
                                <div className={s.PaymentDetails}>
                                    <span className={s.PaymentLabel}>Дата окончания</span>
                                    {
                                        isPaymentEditing ?
                                        <Input 
                                            value={userData.paymentInfo.validUntilDate} 
                                            onChange={(e) => handleChangePaymentInfo(e.target.value, "validUntilDate")}
                                            placeholder="ММ/ГГ"
                                        /> :
                                        <span className={s.PaymentValue}>{userData.paymentInfo.validUntilDate || "-"}</span>
                                    }
                                </div>
                            </div>

                            <div className={s.InfoItem}>
                                <div className={s.PaymentDetails}>
                                    <span className={s.PaymentLabel}>CVV</span>
                                    {
                                        isPaymentEditing ?
                                        <Input 
                                            value={userData.paymentInfo.cvv} 
                                            onChange={(e) => handleChangePaymentInfo(e.target.value, "cvv")}
                                            type="password"
                                            maxLength={3}
                                        /> :
                                        <span className={s.PaymentValue}>{userData.paymentInfo.cvv || "-"}</span>
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            isPaymentEditing 
                            ?
                            <Button variant="primary" className={s.EditButton} onClick={savePaymentData}>
                                Сохранить
                            </Button>
                            :
                            <Button variant="primary" className={s.EditButton} onClick={handleEditPaymentInfo}>
                                ✏️ Редактировать данные
                            </Button>
                        }
                    </div>
                </div>     
            </div>
        </section>
    )
}

export { Personal }