import { useState, useEffect } from "react";
import { Button, Input, ErrorMessage } from "../../../shared";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../shared/data-access/constants/routes";
import s from './TicketsManager.module.scss';
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { CreateTicketRequest, OrdersListResponse } from "../../data-access";
import { useCreateTicketMutation } from "../../services/userApi";

const TicketsManager = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState<Omit<CreateTicketRequest, 'status' | 'solution'>>({
    issue: "",
    details: "",
    order_id: "",
  });

  const [ticketCreated, setTicketCreated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createTicket, { 
    isLoading: createLoading, 
    error: createError,
    isSuccess: createSuccess 
  }] = useCreateTicketMutation();

  useEffect(() => {
    if (createSuccess) {
      setTicketCreated(true);
      setTimeout(() => {
        navigate(APP_ROUTES.userAccount);
      }, 3000);
    }
  }, [createSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.issue.trim()) {
      newErrors.issue = "Укажите тему обращения";
    }
    if (!formData.details.trim()) {
      newErrors.details = "Опишите проблему подробнее";
    }
    if (!formData.order_id.trim()) {
      newErrors.order_id = "Выберите заказ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCreateTicket = async () => {
    if (!validateForm()) {
      return;
    }

    const ticketData: CreateTicketRequest = {
      issue: formData.issue,
      details: formData.details,
      order_id: formData.order_id,
      status: "Created",
      solution: "",
    };

    try {
      await createTicket(ticketData).unwrap();
    } catch (error) {
      console.error("Ошибка создания тикета:", error);
    }
  };

  const getOrderDisplayText = (order: OrdersListResponse): string => {
    const orderNumber = order.id || `#${order.id.slice(-8)}`;
    const status = order.status || '';
    
    return `Заказ ${orderNumber}${status ? ` (${status})` : ''}`;
  };

  if (ticketCreated) {
    return (
      <div className={s.Container}>
        <div className={s.SuccessContainer}>
          <div className={s.SuccessIcon}>✓</div>
          <h2 className={s.SuccessTitle}>Обращение успешно создано!</h2>
          <p className={s.SuccessMessage}>
            Ваше обращение принято в обработку. Вы будете перенаправлены в личный кабинет...
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate(APP_ROUTES.userAccount)}
            className={s.SuccessButton}
          >
            Перейти в личный кабинет
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.Container}>
      <div className={s.Header}>
        <h1 className={s.Title}>Создание обращения</h1>
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
          <h2 className={s.SectionTitle}>Информация об обращении</h2>
          <div className={s.FormGrid}>
            <div className={s.FormGroup}>
              <label className={s.Label}>Тема обращения *</label>
              <Input
                value={formData.issue}
                onChange={(e) => handleInputChange("issue", e.target.value)}
                placeholder="Например: Проблема с оплатой заказа"
                error={!!errors.issue}
              />
              {errors.issue && <span className={s.ErrorText}>{errors.issue}</span>}
            </div>

            <div className={s.FormGroup}>
              <label className={s.Label}>Связанный заказ *</label>
              <select
                value={formData.order_id}
                onChange={(e) => handleInputChange("order_id", e.target.value)}
                className={`
                  ${s.Select} 
                  ${errors.order_id ? s.SelectError : ''}
                `}
              >
                <option value="">Выберите заказ</option>
                {user.orders?.map(order => (
                  <option key={order.id} value={order.id}>
                    {getOrderDisplayText(order)}
                  </option>
                ))}
              </select>
              {errors.order_id && <span className={s.ErrorText}>{errors.order_id}</span>}
              {!user.orders || user.orders.length === 0 ? (
                <p className={s.HelpText}>
                  У вас нет доступных заказов. Сначала создайте заказ.
                </p>
              ) : (
                <p className={s.HelpText}>
                  Выберите заказ, к которому относится ваше обращение
                </p>
              )}
            </div>

            <div className={s.FormGroupFull}>
              <label className={s.Label}>Подробное описание проблемы *</label>
              <textarea
                value={formData.details}
                onChange={(e) => handleInputChange("details", e.target.value)}
                placeholder="Опишите вашу проблему максимально подробно..."
                className={`${s.Textarea} ${errors.details ? s.TextareaError : ''}`}
                rows={6}
              />
              {errors.details && <span className={s.ErrorText}>{errors.details}</span>}
              <p className={s.HelpText}>
                Опишите проблему детально: что произошло, когда, какие ожидания были и что получилось
              </p>
            </div>
          </div>
        </div>

        {createError && (
          <ErrorMessage
            title="Ошибка создания обращения"
            message="Не удалось создать обращение. Попробуйте еще раз."
            onRetry={handleCreateTicket}
          />
        )}

        <div className={s.Actions}>
          <Button
            variant="primary"
            onClick={handleCreateTicket}
            disabled={createLoading || !user.orders || user.orders.length === 0}
            className={s.CreateButton}
            fullWidth
          >
            {createLoading ? "Создание обращения..." : "Создать обращение"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { TicketsManager };

