import type { FC } from "react"
import s from './Loader.module.scss'

type LoaderProps = {
    size?: 'small' | 'medium' | 'large'
}

const Loader: FC<LoaderProps> = ({ size = 'medium' }) => {
    return (
        <div className={`${s.Loader} ${s[size]}`}>
            <div className={s.Spinner}></div>
        </div>
    )
}

export { Loader }