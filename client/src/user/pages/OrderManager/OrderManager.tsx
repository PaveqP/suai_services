import { useState, useEffect } from "react";
import { useGetOrderPriceQuery, useCreateOrderMutation } from "../../services/userApi";
import { Button, Input, Loader, ErrorMessage } from "../../../shared";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../shared/data-access/constants/routes";
import type { CreateOrderRequest, serviceClasses } from "../../data-access";
import s from './OrderManager.module.scss';

const OrderManager = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Omit<CreateOrderRequest, 'price' | 'options'> & { options: { child: boolean; pet: boolean } }>({
    city: "Saint-Petersburg",
    start_trip_street: "",
    start_trip_house: "",
    start_trip_build: "",
    destination_street: "",
    destination_house: "",
    destination_build: "",
    service_category: "business" as serviceClasses,
    options: {
      child: false,
      pet: false,
    },
  });

  const [price, setPrice] = useState<string>("");
  const [orderCreated, setOrderCreated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const priceQueryParams = formData.start_trip_street && 
    formData.start_trip_house && 
    formData.destination_street && 
    formData.destination_house
    ? `start_trip_street=${encodeURIComponent(formData.start_trip_street)}&start_trip_house=${encodeURIComponent(formData.start_trip_house)}&destination_street=${encodeURIComponent(formData.destination_street)}&destination_house=${encodeURIComponent(formData.destination_house)}&service_category=${formData.service_category}`
    : "";

  const { 
    data: priceData, 
    isLoading: priceLoading, 
    error: priceError,
    refetch: refetchPrice
  } = useGetOrderPriceQuery(priceQueryParams, {
    skip: !priceQueryParams,
  });

  const [createOrder, { 
    isLoading: createLoading, 
    error: createError,
    isSuccess: createSuccess 
  }] = useCreateOrderMutation();

  useEffect(() => {
    if (priceData) {
      setPrice(String(priceData.price));
    }
  }, [priceData]);

  useEffect(() => {
    if (createSuccess) {
      setOrderCreated(true);
      setTimeout(() => {
        navigate(APP_ROUTES.userAccount);
      }, 3000);
    }
  }, [createSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.start_trip_street.trim()) {
      newErrors.start_trip_street = "Укажите улицу отправления";
    }
    if (!formData.start_trip_house.trim()) {
      newErrors.start_trip_house = "Укажите дом отправления";
    }
    if (!formData.destination_street.trim()) {
      newErrors.destination_street = "Укажите улицу назначения";
    }
    if (!formData.destination_house.trim()) {
      newErrors.destination_house = "Укажите дом назначения";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Укажите город";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === "child" || field === "pet") {
      setFormData(prev => ({
        ...prev,
        options: {
          ...prev.options,
          [field]: value as boolean,
        },
      }));
    } else if (field === "service_category") {
      setFormData(prev => ({
        ...prev,
        [field]: value as serviceClasses,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value as string,
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleGetPrice = () => {
    if (validateForm()) {
      refetchPrice();
    }
  };

  const handleCreateOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (!price) {
      setErrors(prev => ({ ...prev, price: "Сначала получите стоимость поездки" }));
      return;
    }

    const orderData: CreateOrderRequest = {
      city: formData.city,
      start_trip_street: formData.start_trip_street,
      start_trip_house: formData.start_trip_house,
      start_trip_build: formData.start_trip_build,
      destination_street: formData.destination_street,
      destination_house: formData.destination_house,
      destination_build: formData.destination_build,
      service_category: formData.service_category,
      price: Number(price),
      options: (formData.options.child || formData.options.pet) ? formData.options : undefined,
    };

    try {
      await createOrder(orderData).unwrap();
    } catch (error) {
      console.error("Ошибка создания заказа:", error);
    }
  };

  if (orderCreated) {
    return (
      <div className={s.Container}>
        <div className={s.SuccessContainer}>
          <div className={s.SuccessIcon}>✓</div>
          <h2 className={s.SuccessTitle}>Заказ успешно создан!</h2>
          <p className={s.SuccessMessage}>
            Ваш заказ принят в обработку. Вы будете перенаправлены на страницу с заказами...
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate(APP_ROUTES.userAccount)}
            className={s.SuccessButton}
          >
            Перейти к заказам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.Container}>
      <div className={s.Header}>
        <h1 className={s.Title}>Создание заказа</h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate(APP_ROUTES.userAccount)}
          className={s.BackButton}
        >
          ← Назад
        </Button>
      </div>

      <div className={s.Content}>
        <div className={s.FormSection}>
          <h2 className={s.SectionTitle}>Адрес отправления</h2>
          <div className={s.FormGrid}>
            <div className={s.FormGroup}>
              <label className={s.Label}>Город *</label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Например: Saint-Petersburg"
                error={!!errors.city}
              />
              {errors.city && <span className={s.ErrorText}>{errors.city}</span>}
            </div>

            <div className={s.FormGroup}>
              <label className={s.Label}>Улица *</label>
              <Input
                value={formData.start_trip_street}
                onChange={(e) => handleInputChange("start_trip_street", e.target.value)}
                placeholder="Например: Дальневосточный проспект"
                error={!!errors.start_trip_street}
              />
              {errors.start_trip_street && <span className={s.ErrorText}>{errors.start_trip_street}</span>}
            </div>

            <div className={s.FormGroup}>
              <label className={s.Label}>Дом *</label>
              <Input
                value={formData.start_trip_house}
                onChange={(e) => handleInputChange("start_trip_house", e.target.value)}
                placeholder="Например: 10"
                error={!!errors.start_trip_house}
              />
              {errors.start_trip_house && <span className={s.ErrorText}>{errors.start_trip_house}</span>}
            </div>

            <div className={s.FormGroup}>
              <label className={s.Label}>Корпус/Строение</label>
              <Input
                value={formData.start_trip_build}
                onChange={(e) => handleInputChange("start_trip_build", e.target.value)}
                placeholder="Необязательно"
              />
            </div>
          </div>
        </div>

        <div className={s.FormSection}>
          <h2 className={s.SectionTitle}>Адрес назначения</h2>
          <div className={s.FormGrid}>
            <div className={s.FormGroup}>
              <label className={s.Label}>Улица *</label>
              <Input
                value={formData.destination_street}
                onChange={(e) => handleInputChange("destination_street", e.target.value)}
                placeholder="Например: Большая морская улица"
                error={!!errors.destination_street}
              />
              {errors.destination_street && <span className={s.ErrorText}>{errors.destination_street}</span>}
            </div>

            <div className={s.FormGroup}>
              <label className={s.Label}>Дом *</label>
              <Input
                value={formData.destination_house}
                onChange={(e) => handleInputChange("destination_house", e.target.value)}
                placeholder="Например: 25"
                error={!!errors.destination_house}
              />
              {errors.destination_house && <span className={s.ErrorText}>{errors.destination_house}</span>}
            </div>

            <div className={s.FormGroup}>
              <label className={s.Label}>Корпус/Строение</label>
              <Input
                value={formData.destination_build}
                onChange={(e) => handleInputChange("destination_build", e.target.value)}
                placeholder="Необязательно"
              />
            </div>
          </div>
        </div>

        <div className={s.FormSection}>
          <h2 className={s.SectionTitle}>Категория услуги</h2>
          <div className={s.ServiceCategoryGroup}>
            <label className={s.RadioLabel}>
              <input
                type="radio"
                name="service_category"
                value="business"
                checked={formData.service_category === "business"}
                onChange={(e) => handleInputChange("service_category", e.target.value)}
                className={s.RadioInput}
              />
              <span className={s.RadioText}>Business</span>
            </label>
            <label className={s.RadioLabel}>
              <input
                type="radio"
                name="service_category"
                value="comfort"
                checked={formData.service_category === "comfort"}
                onChange={(e) => handleInputChange("service_category", e.target.value)}
                className={s.RadioInput}
              />
              <span className={s.RadioText}>Comfort</span>
            </label>
            <label className={s.RadioLabel}>
              <input
                type="radio"
                name="service_category"
                value="econom"
                checked={formData.service_category === "econom"}
                onChange={(e) => handleInputChange("service_category", e.target.value)}
                className={s.RadioInput}
              />
              <span className={s.RadioText}>Econom</span>
            </label>
          </div>
        </div>

        <div className={s.FormSection}>
          <h2 className={s.SectionTitle}>Дополнительные опции</h2>
          <div className={s.OptionsGroup}>
            <label className={s.CheckboxLabel}>
              <input
                type="checkbox"
                checked={formData.options.child}
                onChange={(e) => handleInputChange("child", e.target.checked)}
                className={s.CheckboxInput}
              />
              <span className={s.CheckboxText}>👶 Детское кресло</span>
            </label>
            <label className={s.CheckboxLabel}>
              <input
                type="checkbox"
                checked={formData.options.pet}
                onChange={(e) => handleInputChange("pet", e.target.checked)}
                className={s.CheckboxInput}
              />
              <span className={s.CheckboxText}>🐕 Перевозка животных</span>
            </label>
          </div>
        </div>

        {priceError && (
          <ErrorMessage
            title="Ошибка получения стоимости"
            message="Не удалось получить стоимость поездки. Проверьте правильность введенных данных."
            onRetry={handleGetPrice}
          />
        )}

        {createError && (
          <ErrorMessage
            title="Ошибка создания заказа"
            message="Не удалось создать заказ. Попробуйте еще раз."
            onRetry={handleCreateOrder}
          />
        )}

        <div className={s.PriceSection}>
          <div className={s.PriceCard}>
            <div className={s.PriceHeader}>
              <h3 className={s.PriceTitle}>Стоимость поездки</h3>
              {priceLoading && <Loader size="small" />}
            </div>
            {price ? (
              <div className={s.PriceValue}>
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                }).format(Number(price))}
              </div>
            ) : (
              <p className={s.PricePlaceholder}>
                Заполните адреса и нажмите "Узнать стоимость"
              </p>
            )}
            <Button
              variant="primary"
              onClick={handleGetPrice}
              disabled={priceLoading}
              className={s.GetPriceButton}
            >
              {priceLoading ? "Загрузка..." : "Узнать стоимость"}
            </Button>
          </div>
        </div>

        <div className={s.Actions}>
          <Button
            variant="primary"
            onClick={handleCreateOrder}
            disabled={!price || createLoading || priceLoading}
            className={s.CreateButton}
            fullWidth
          >
            {createLoading ? "Создание заказа..." : "Создать заказ"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { OrderManager };

