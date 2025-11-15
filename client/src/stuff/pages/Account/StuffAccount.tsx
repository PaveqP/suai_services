import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Loader, ErrorMessage, APP_ROUTES } from "../../../shared";
import { useAppDispatch } from "../../../store/store";
import { logout } from "../../../store/slices/authSlice";
import { useCreateDriverMutation, useGetTicketsQuery, useUpdateTicketMutation } from "../../services/stuffApi";
import type { CreateDriverRequest, TicketResponse, UpdateTicketRequest } from "../../data-access";
import s from './StuffAccount.module.scss';

const StuffAccount = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"drivers" | "tickets">("drivers");

  const { data: tickets, isLoading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useGetTicketsQuery();

  const [formData, setFormData] = useState<CreateDriverRequest>({
    name: "",
    surname: "",
    email: "",
    password: "",
    phone_number: "",
    driver_license: {
      name: "",
      surname: "",
      lastname: "",
      series: "",
      doc_number: "",
      date_of_birth: "",
      place_of_birth: "",
      date_of_issue: "",
      valid_until: "",
      residence: "",
      issued_unit: "",
      license_category: "",
    },
  });

  const [createDriver, { isLoading: isCreating, error: createError, isSuccess: createSuccess }] = useCreateDriverMutation();
  const [updateTicket] = useUpdateTicketMutation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogout = () => {
    dispatch(logout());
    navigate(APP_ROUTES.stuffAuth);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Обязательное поле";
    if (!formData.surname.trim()) newErrors.surname = "Обязательное поле";
    if (!formData.email.trim()) newErrors.email = "Обязательное поле";
    if (!formData.password.trim()) newErrors.password = "Обязательное поле";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Обязательное поле";
    
    if (!formData.driver_license.name.trim()) newErrors["driver_license.name"] = "Обязательное поле";
    if (!formData.driver_license.surname.trim()) newErrors["driver_license.surname"] = "Обязательное поле";
    if (!formData.driver_license.lastname.trim()) newErrors["driver_license.lastname"] = "Обязательное поле";
    if (!formData.driver_license.series.trim()) newErrors["driver_license.series"] = "Обязательное поле";
    if (!formData.driver_license.doc_number.trim()) newErrors["driver_license.doc_number"] = "Обязательное поле";
    if (!formData.driver_license.date_of_birth.trim()) newErrors["driver_license.date_of_birth"] = "Обязательное поле";
    if (!formData.driver_license.place_of_birth.trim()) newErrors["driver_license.place_of_birth"] = "Обязательное поле";
    if (!formData.driver_license.date_of_issue.trim()) newErrors["driver_license.date_of_issue"] = "Обязательное поле";
    if (!formData.driver_license.valid_until.trim()) newErrors["driver_license.valid_until"] = "Обязательное поле";
    if (!formData.driver_license.residence.trim()) newErrors["driver_license.residence"] = "Обязательное поле";
    if (!formData.driver_license.issued_unit.trim()) newErrors["driver_license.issued_unit"] = "Обязательное поле";
    if (!formData.driver_license.license_category.trim()) newErrors["driver_license.license_category"] = "Обязательное поле";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("driver_license.")) {
      const licenseField = field.replace("driver_license.", "");
      setFormData(prev => ({
        ...prev,
        driver_license: {
          ...prev.driver_license,
          [licenseField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await createDriver(formData).unwrap();
        setFormData({
          name: "",
          surname: "",
          email: "",
          password: "",
          phone_number: "",
          driver_license: {
            name: "",
            surname: "",
            lastname: "",
            series: "",
            doc_number: "",
            date_of_birth: "",
            place_of_birth: "",
            date_of_issue: "",
            valid_until: "",
            residence: "",
            issued_unit: "",
            license_category: "",
          },
        });
      } catch (error) {
        console.error("Ошибка создания водителя:", error);
      }
    }
  };

  const handleUpdateTicket = async (ticketId: string, data: UpdateTicketRequest) => {
    try {
      await updateTicket({ id: ticketId, data }).unwrap();
      refetchTickets();
    } catch (error) {
      console.error("Ошибка обновления тикета:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'open': '#3b82f6',
      'in_progress': '#f59e0b',
      'resolved': '#22c55e',
      'closed': '#6b7280',
    };
    return statusColors[status] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors: { [key: string]: string } = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#ef4444',
      'critical': '#dc2626',
    };
    return priorityColors[priority] || '#6b7280';
  };

  return (
    <div className={s.Container}>
      <div className={s.Header}>
        <h1 className={s.Title}>Личный кабинет сотрудника</h1>
        <Button 
          variant="secondary" 
          onClick={handleLogout}
          className={s.LogoutButton}
        >
          Выйти
        </Button>
      </div>

      <div className={s.Tabs}>
        <button
          className={`${s.Tab} ${activeTab === "drivers" ? s.ActiveTab : ""}`}
          onClick={() => setActiveTab("drivers")}
        >
          Создание водителей
        </button>
        <button
          className={`${s.Tab} ${activeTab === "tickets" ? s.ActiveTab : ""}`}
          onClick={() => setActiveTab("tickets")}
        >
          Разбор тикетов
          {tickets && tickets.filter(t => t.status === "open" || t.status === "in_progress").length > 0 && (
            <span className={s.Badge}>
              {tickets.filter(t => t.status === "open" || t.status === "in_progress").length}
            </span>
          )}
        </button>
      </div>

      <div className={s.Content}>
        {activeTab === "drivers" && (
          <div className={s.FormCard}>
            <h2 className={s.CardTitle}>Создание нового водителя</h2>
            
            {createSuccess && (
              <div className={s.SuccessMessage}>
                Водитель успешно создан!
              </div>
            )}

            {createError && (
              <ErrorMessage
                title="Ошибка создания водителя"
                message="Не удалось создать водителя. Проверьте правильность введенных данных."
              />
            )}

            <form onSubmit={handleSubmit} className={s.Form}>
              <div className={s.Section}>
                <h3 className={s.SectionTitle}>Основная информация</h3>
                <div className={s.FormGrid}>
                  <div className={s.FormGroup}>
                    <label className={s.Label}>Имя *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Имя"
                      error={!!errors.name}
                    />
                    {errors.name && <span className={s.ErrorText}>{errors.name}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Фамилия *</label>
                    <Input
                      value={formData.surname}
                      onChange={(e) => handleInputChange("surname", e.target.value)}
                      placeholder="Фамилия"
                      error={!!errors.surname}
                    />
                    {errors.surname && <span className={s.ErrorText}>{errors.surname}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@example.com"
                      error={!!errors.email}
                    />
                    {errors.email && <span className={s.ErrorText}>{errors.email}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Пароль *</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Пароль"
                      error={!!errors.password}
                    />
                    {errors.password && <span className={s.ErrorText}>{errors.password}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Номер телефона *</label>
                    <Input
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      error={!!errors.phone_number}
                    />
                    {errors.phone_number && <span className={s.ErrorText}>{errors.phone_number}</span>}
                  </div>
                </div>
              </div>

              <div className={s.Section}>
                <h3 className={s.SectionTitle}>Водительские права</h3>
                <div className={s.FormGrid}>
                  <div className={s.FormGroup}>
                    <label className={s.Label}>Имя *</label>
                    <Input
                      value={formData.driver_license.name}
                      onChange={(e) => handleInputChange("driver_license.name", e.target.value)}
                      placeholder="Имя"
                      error={!!errors["driver_license.name"]}
                    />
                    {errors["driver_license.name"] && <span className={s.ErrorText}>{errors["driver_license.name"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Фамилия *</label>
                    <Input
                      value={formData.driver_license.surname}
                      onChange={(e) => handleInputChange("driver_license.surname", e.target.value)}
                      placeholder="Фамилия"
                      error={!!errors["driver_license.surname"]}
                    />
                    {errors["driver_license.surname"] && <span className={s.ErrorText}>{errors["driver_license.surname"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Отчество *</label>
                    <Input
                      value={formData.driver_license.lastname}
                      onChange={(e) => handleInputChange("driver_license.lastname", e.target.value)}
                      placeholder="Отчество"
                      error={!!errors["driver_license.lastname"]}
                    />
                    {errors["driver_license.lastname"] && <span className={s.ErrorText}>{errors["driver_license.lastname"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Серия *</label>
                    <Input
                      value={formData.driver_license.series}
                      onChange={(e) => handleInputChange("driver_license.series", e.target.value)}
                      placeholder="127 893"
                      error={!!errors["driver_license.series"]}
                    />
                    {errors["driver_license.series"] && <span className={s.ErrorText}>{errors["driver_license.series"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Номер документа *</label>
                    <Input
                      value={formData.driver_license.doc_number}
                      onChange={(e) => handleInputChange("driver_license.doc_number", e.target.value)}
                      placeholder="123 456 987"
                      error={!!errors["driver_license.doc_number"]}
                    />
                    {errors["driver_license.doc_number"] && <span className={s.ErrorText}>{errors["driver_license.doc_number"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Дата рождения *</label>
                    <Input
                      type="date"
                      value={formData.driver_license.date_of_birth}
                      onChange={(e) => handleInputChange("driver_license.date_of_birth", e.target.value)}
                      error={!!errors["driver_license.date_of_birth"]}
                    />
                    {errors["driver_license.date_of_birth"] && <span className={s.ErrorText}>{errors["driver_license.date_of_birth"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Место рождения *</label>
                    <Input
                      value={formData.driver_license.place_of_birth}
                      onChange={(e) => handleInputChange("driver_license.place_of_birth", e.target.value)}
                      placeholder="Saint-Petersburg"
                      error={!!errors["driver_license.place_of_birth"]}
                    />
                    {errors["driver_license.place_of_birth"] && <span className={s.ErrorText}>{errors["driver_license.place_of_birth"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Дата выдачи *</label>
                    <Input
                      type="date"
                      value={formData.driver_license.date_of_issue}
                      onChange={(e) => handleInputChange("driver_license.date_of_issue", e.target.value)}
                      error={!!errors["driver_license.date_of_issue"]}
                    />
                    {errors["driver_license.date_of_issue"] && <span className={s.ErrorText}>{errors["driver_license.date_of_issue"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Действительно до *</label>
                    <Input
                      type="date"
                      value={formData.driver_license.valid_until}
                      onChange={(e) => handleInputChange("driver_license.valid_until", e.target.value)}
                      error={!!errors["driver_license.valid_until"]}
                    />
                    {errors["driver_license.valid_until"] && <span className={s.ErrorText}>{errors["driver_license.valid_until"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Место жительства *</label>
                    <Input
                      value={formData.driver_license.residence}
                      onChange={(e) => handleInputChange("driver_license.residence", e.target.value)}
                      placeholder="Saint-Petersburg"
                      error={!!errors["driver_license.residence"]}
                    />
                    {errors["driver_license.residence"] && <span className={s.ErrorText}>{errors["driver_license.residence"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Орган выдачи *</label>
                    <Input
                      value={formData.driver_license.issued_unit}
                      onChange={(e) => handleInputChange("driver_license.issued_unit", e.target.value)}
                      placeholder="internal business department"
                      error={!!errors["driver_license.issued_unit"]}
                    />
                    {errors["driver_license.issued_unit"] && <span className={s.ErrorText}>{errors["driver_license.issued_unit"]}</span>}
                  </div>

                  <div className={s.FormGroup}>
                    <label className={s.Label}>Категория прав *</label>
                    <Input
                      value={formData.driver_license.license_category}
                      onChange={(e) => handleInputChange("driver_license.license_category", e.target.value)}
                      placeholder="B"
                      error={!!errors["driver_license.license_category"]}
                    />
                    {errors["driver_license.license_category"] && <span className={s.ErrorText}>{errors["driver_license.license_category"]}</span>}
                  </div>
                </div>
              </div>

            </form>

            <div className={s.Actions}>
              <Button
                type="submit"
                variant="primary"
                disabled={isCreating}
                className={s.SubmitButton}
                fullWidth
                onClick={(e) => {
                  e.preventDefault();
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  handleSubmit(e as any);
                }}
              >
                {isCreating ? "Создание..." : "Создать водителя"}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className={s.TicketsCard}>
            <h2 className={s.CardTitle}>Разбор тикетов</h2>
            
            {ticketsLoading && (
              <div className={s.LoadingContainer}>
                <Loader size="large" />
                <p>Загружаем тикеты...</p>
              </div>
            )}

            {ticketsError && (
              <ErrorMessage
                title="Ошибка загрузки тикетов"
                message="Не удалось загрузить тикеты"
                onRetry={() => refetchTickets()}
              />
            )}

            {tickets && tickets.length > 0 ? (
              <div className={s.TicketsList}>
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onUpdate={handleUpdateTicket}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            ) : (
              <div className={s.EmptyState}>
                <div className={s.EmptyIcon}>🎫</div>
                <h3>Тикетов пока нет</h3>
                <p>Новые тикеты появятся здесь</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TicketCard = ({
  ticket,
  onUpdate,
  getStatusColor,
}: {
  ticket: TicketResponse;
  onUpdate: (id: string, data: UpdateTicketRequest) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(ticket.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    setIsUpdating(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await onUpdate(ticket.id, { status: newStatus as any });
    setIsUpdating(false);
  };

  return (
    <div className={s.TicketCard}>
      <div className={s.TicketHeader}>
        <div className={s.TicketTitleSection}>
          <h3 className={s.TicketTitle}>{ticket.issue}</h3>
          <div className={s.TicketMeta}>
            <span className={s.TicketId}>ID: {ticket.id}</span>
            {/* <span className={s.TicketDate}>
              {new Date(ticket.created_at).toLocaleString('ru-RU')}
            </span> */}
          </div>
        </div>
        <div className={s.TicketBadges}>
          <select
            className={s.StatusSelect}
            style={{ backgroundColor: getStatusColor(selectedStatus) }}
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdating}
          >
            <option value="open">Открыт</option>
            <option value="in_progress">В работе</option>
            <option value="resolved">Решен</option>
            <option value="closed">Закрыт</option>
          </select>
        </div>
      </div>
      
      <div className={s.TicketBody}>
        <p className={s.TicketDescription}>{ticket.details}</p>
        <div className={s.TicketInfo}>
          {/* {ticket.user_email && (
            <div className={s.TicketInfoItem}>
              <span className={s.TicketInfoLabel}>Пользователь:</span>
              <span className={s.TicketInfoValue}>{ticket.user_email}</span>
            </div>
          )}
          {ticket.driver_email && (
            <div className={s.TicketInfoItem}>
              <span className={s.TicketInfoLabel}>Водитель:</span>
              <span className={s.TicketInfoValue}>{ticket.driver_email}</span>
            </div>
          )} */}
          {ticket.order_id && (
            <div className={s.TicketInfoItem}>
              <span className={s.TicketInfoLabel}>Заказ:</span>
              <span className={s.TicketInfoValue}>{ticket.order_id}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { StuffAccount };
