import React from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES, Button, ErrorMessage, Input, Loader } from '../../../shared'
import { logout } from '../../../store/slices/authSlice'
import { useAppDispatch } from '../../../store/store'
import { useGetInfoQuery, useUpdateInfoMutation, useGetCarsQuery, useAddCarMutation } from '../../services/driverApi'
import s from './DriverPersonal.module.scss'
import { useEffect, useState } from 'react'
import type { CarInfo, UpdateDriverInfoResponse } from '../../data-access'

const DriverPersonal: React.FC = () => {
  const { data: personalInfo, isLoading: infoLoading, error: infoError } = useGetInfoQuery()
  const { data: cars, isLoading: carsLoading } = useGetCarsQuery()
  const [updateInfo] = useUpdateInfoMutation()
  const [addCar, { isLoading: isAddingCar }] = useAddCarMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate(APP_ROUTES.driverAuth)
  }

  const handleGoMain = () => {
    navigate(APP_ROUTES.driverAccount)
  }

  const [driverData, setDriverData] = useState<UpdateDriverInfoResponse>({
    name: '',
    surname: '',
    lastname: '',
    phone_number: '',
    driver_license: {
      name: '',
      surname: '',
      lastname: '',
      series: '',
      doc_number: '',
      date_of_birth: '',
      place_of_birth: '',
      date_of_issue: '',
      valid_until: '',
      residence: '',
      issued_unit: '',
      license_category: '',
    }
  })

  const [carData, setCarData] = useState<CarInfo>({
    brand: '',
    model: '',
    year: '',
    color: '',
    license_plate: '',
  })

  useEffect(() => {
    if (personalInfo) {
      setDriverData({
        name: personalInfo.name || '',
        surname: personalInfo.surname || '',
        lastname: personalInfo.lastname || '',
        phone_number: personalInfo.phone_number || '',
        driver_license: personalInfo.driver_license ? {
          name: personalInfo.driver_license.name || '',
          surname: personalInfo.driver_license.surname || '',
          lastname: personalInfo.driver_license.lastname || '',
          series: personalInfo.driver_license.series || '',
          doc_number: personalInfo.driver_license.doc_number || '',
          date_of_birth: personalInfo.driver_license.date_of_birth || '',
          place_of_birth: personalInfo.driver_license.place_of_birth || '',
          date_of_issue: personalInfo.driver_license.date_of_issue || '',
          valid_until: personalInfo.driver_license.valid_until || '',
          residence: personalInfo.driver_license.residence || '',
          issued_unit: personalInfo.driver_license.issued_unit || '',
          license_category: personalInfo.driver_license.license_category || '',
        } : undefined,
      })
    }
  }, [personalInfo])

  const [isPersonalEditing, setIsPersonalEditing] = useState<boolean>(false)
  const [isLicenseEditing, setIsLicenseEditing] = useState<boolean>(false)
  const [isCarFormVisible, setIsCarFormVisible] = useState<boolean>(false)

  const handleEditPersonalInfo = () => {
    setIsPersonalEditing(true)
  }

  const handleEditLicenseInfo = () => {
    setIsLicenseEditing(true)
  }

  const handleChangePersonalInfo = (value: string, parameter: keyof UpdateDriverInfoResponse) => {
    setDriverData(prev => ({
      ...prev,
      [parameter]: value
    }))
  }

  const handleChangeLicenseInfo = (value: string, parameter: string) => {
    setDriverData(prev => ({
      ...prev,
      driver_license: {
        ...(prev.driver_license || {}),
        [parameter]: value
      } as any
    }))
  }

  const handleChangeCarInfo = (value: string, parameter: keyof CarInfo) => {
    setCarData(prev => ({
      ...prev,
      [parameter]: value
    }))
  }

  const savePersonalData = () => {
    updateInfo({
      name: driverData.name,
      surname: driverData.surname,
      lastname: driverData.lastname,
      phone_number: driverData.phone_number,
    })
    setIsPersonalEditing(false)
  }

  const saveLicenseData = () => {
    updateInfo({
      driver_license: driverData.driver_license
    })
    setIsLicenseEditing(false)
  }

  const handleAddCar = async () => {
    try {
      await addCar(carData).unwrap()
      setCarData({
        brand: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
      })
      setIsCarFormVisible(false)
    } catch (error) {
      console.error("Ошибка добавления автомобиля:", error)
    }
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

  if (infoLoading || carsLoading) {
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
          <Button className={s.BackButton} onClick={handleGoMain}>
            {"<-"} На главную
          </Button>
        </div>
        <div className={s.Header}>
          <h1 className={s.Title}>Личный кабинет водителя</h1>
          <div className={s.Avatar}>
            {personalInfo.name?.[0]}{personalInfo.surname?.[0]}
          </div>
        </div>
        <Button variant="secondary" className={s.LogoutButton} onClick={handleLogout}>
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
                <Input value={driverData.name || ''} onChange={(e) => handleChangePersonalInfo(e.target.value, "name")}/> :
                <span className={s.InfoValue}>{personalInfo.name || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Фамилия</span>
              {
                isPersonalEditing ?
                <Input value={driverData.surname || ''} onChange={(e) => handleChangePersonalInfo(e.target.value, "surname")}/> :
                <span className={s.InfoValue}>{personalInfo.surname || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Отчество</span>
              {
                isPersonalEditing ?
                <Input value={driverData.lastname || ''} onChange={(e) => handleChangePersonalInfo(e.target.value, "lastname")}/> :
                <span className={s.InfoValue}>{personalInfo.lastname || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Телефон</span>
              {
                isPersonalEditing ?
                <Input value={driverData.phone_number || ''} onChange={(e) => handleChangePersonalInfo(e.target.value, "phone_number")}/> :
                <span className={s.InfoValue}>{personalInfo.phone_number || "-"}</span>
              }
            </div>

            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Email</span>
              <span className={s.InfoValue}>{personalInfo.email || "-"}</span>
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
          <h2 className={s.CardTitle}>Водительские права</h2>
          
          <div className={s.InfoGrid}>
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Имя</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.name || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "name")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.name || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Фамилия</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.surname || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "surname")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.surname || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Отчество</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.lastname || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "lastname")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.lastname || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Серия</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.series || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "series")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.series || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Номер</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.doc_number || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "doc_number")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.doc_number || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Дата рождения</span>
              {
                isLicenseEditing ?
                <Input type="date" value={driverData.driver_license?.date_of_birth || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "date_of_birth")}/> :
                <span className={s.InfoValue}>{formatDate(personalInfo.driver_license?.date_of_birth || "")}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Место рождения</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.place_of_birth || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "place_of_birth")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.place_of_birth || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Дата выдачи</span>
              {
                isLicenseEditing ?
                <Input type="date" value={driverData.driver_license?.date_of_issue || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "date_of_issue")}/> :
                <span className={s.InfoValue}>{formatDate(personalInfo.driver_license?.date_of_issue || "")}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Действительно до</span>
              {
                isLicenseEditing ?
                <Input type="date" value={driverData.driver_license?.valid_until || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "valid_until")}/> :
                <span className={s.InfoValue}>{formatDate(personalInfo.driver_license?.valid_until || "")}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Место жительства</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.residence || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "residence")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.residence || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Орган выдачи</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.issued_unit || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "issued_unit")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.issued_unit || "-"}</span>
              }
            </div>
            
            <div className={s.InfoItem}>
              <span className={s.InfoLabel}>Категория</span>
              {
                isLicenseEditing ?
                <Input value={driverData.driver_license?.license_category || ''} onChange={(e) => handleChangeLicenseInfo(e.target.value, "license_category")}/> :
                <span className={s.InfoValue}>{personalInfo.driver_license?.license_category || "-"}</span>
              }
            </div>
            
            {
              isLicenseEditing 
              ?
              <Button variant="primary" className={s.EditButton} onClick={saveLicenseData}>
                Сохранить
              </Button>
              :
              <Button variant="primary" className={s.EditButton} onClick={handleEditLicenseInfo}>
                ✏️ Редактировать данные
              </Button>
            }
          </div>
        </div>

        <div className={s.InfoCard}>
          <h2 className={s.CardTitle}>Автомобили</h2>
          
          {cars && cars.length > 0 && (
            <div className={s.CarsList}>
              {cars.map((car, index) => (
                <div key={car.id || index} className={s.CarItem}>
                  <div className={s.CarInfo}>
                    <div className={s.CarBrand}>{car.brand} {car.model}</div>
                    <div className={s.CarDetails}>
                      {car.year} • {car.color} • {car.license_plate}
                    </div>
                    {car.is_active && (
                      <span className={s.ActiveBadge}>Активный</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isCarFormVisible ? (
            <Button variant="primary" className={s.AddCarButton} onClick={() => setIsCarFormVisible(true)}>
              ➕ Добавить автомобиль
            </Button>
          ) : (
            <div className={s.CarForm}>
              <div className={s.InfoGrid}>
                <div className={s.InfoItem}>
                  <span className={s.InfoLabel}>Марка *</span>
                  <Input value={carData.brand} onChange={(e) => handleChangeCarInfo(e.target.value, "brand")} placeholder="Toyota"/>
                </div>
                
                <div className={s.InfoItem}>
                  <span className={s.InfoLabel}>Модель *</span>
                  <Input value={carData.model} onChange={(e) => handleChangeCarInfo(e.target.value, "model")} placeholder="Camry"/>
                </div>
                
                <div className={s.InfoItem}>
                  <span className={s.InfoLabel}>Год *</span>
                  <Input value={carData.year} onChange={(e) => handleChangeCarInfo(e.target.value, "year")} placeholder="2020"/>
                </div>
                
                <div className={s.InfoItem}>
                  <span className={s.InfoLabel}>Цвет *</span>
                  <Input value={carData.color} onChange={(e) => handleChangeCarInfo(e.target.value, "color")} placeholder="Белый"/>
                </div>
                
                <div className={s.InfoItem}>
                  <span className={s.InfoLabel}>Гос. номер *</span>
                  <Input value={carData.license_plate} onChange={(e) => handleChangeCarInfo(e.target.value, "license_plate")} placeholder="А123БВ777"/>
                </div>
              </div>
              <div className={s.CarFormActions}>
                <Button variant="primary" className={s.SaveCarButton} onClick={handleAddCar} disabled={isAddingCar}>
                  {isAddingCar ? "Добавление..." : "Добавить"}
                </Button>
                <Button variant="secondary" className={s.CancelCarButton} onClick={() => setIsCarFormVisible(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>     
      </div>
    </section>
  )
}

export { DriverPersonal }

