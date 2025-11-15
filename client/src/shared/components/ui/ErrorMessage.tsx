import type { FC } from "react"
import s from './ErrorMessage.module.scss'
import { Button } from "./Button"

type ErrorMessageProps = {
    title: string
    message: string
    onRetry?: () => void
}

const ErrorMessage: FC<ErrorMessageProps> = ({ title, message, onRetry }) => {
    return (
        <div className={s.ErrorContainer}>
            <div className={s.ErrorIcon}>⚠️</div>
            <h2 className={s.ErrorTitle}>{title}</h2>
            <p className={s.ErrorMessage}>{message}</p>
            {onRetry && (
                <Button variant="primary" onClick={onRetry}>
                    Попробовать снова
                </Button>
            )}
        </div>
    )
}

export { ErrorMessage }