import { useEffect, useMemo, useState, type FC } from "react"
import type { OrdersListResponse, serviceClasses } from "../../../user/data-access"
import { Input, OrderCard } from "../../components"
import s from "./DrivesList.module.scss"

type DrivesListPropsType = {
    drives: OrdersListResponse[]
}

const DrivesList:FC<DrivesListPropsType> = ({drives}) => {

  type CategoryFilterState = {
    [key in serviceClasses]: boolean
  }

  type PriceFilterState = {
  maxPrice: number
}

type FilterState = {
  categories: CategoryFilterState
  price: PriceFilterState
}

  const initialFilters: FilterState = {
  categories: {
    comfort: false,
    econom: false,
    business: false,
  },
  price: {
    maxPrice: 10000
  }
}

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const maxOrderPrice = useMemo(() => {
    if (!drives || drives.length === 0) return 10000
    return Math.max(...drives.map(drive => Number(drive.price)), 10000)
  }, [drives])

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      price: {
        maxPrice: maxOrderPrice
      }
    }))
  }, [maxOrderPrice])

  // const getCategoryKey = (russianName: string): serviceClasses => {
  //   const mapping: { [key: string]: serviceClasses } = {
  //     'Комфорт': 'comfort',
  //     'Эконом': 'econom', 
  //     'Бизнес': 'business'
  //   }
  //   return mapping[russianName] || 'economy'
  // }

  const handleCategoryChange = (category: serviceClasses) => {
    setFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }))
  }

  const handlePriceChange = (value: number) => {
    setFilters(prev => ({
      ...prev,
      price: {
        maxPrice: value
      }
    }))
  }

  const filteredOrders = useMemo(() => {
    if (!drives) return []

    return drives.filter(drive => {
      const categoryMatch = Object.values(filters.categories).every(value => !value) || 
        filters.categories[drive.service_category]

      const priceMatch = Number(drive.price) <= filters.price.maxPrice

      return categoryMatch && priceMatch
    })
  }, [drives, filters])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <>
    <div className={s.Filters}>
      <div className={s.CategoryFilter}>
        <div className={s.CheckBoxFilter}>
          Комфорт
          <Input type="checkbox" checked={filters.categories.comfort} onChange={() => handleCategoryChange('comfort')} id="comfort-filter"/>
        </div>
        <div className={s.CheckBoxFilter}>
          Эконом
          <Input type="checkbox" checked={filters.categories.econom} onChange={() => handleCategoryChange('econom')} id="economy-filter"/>
        </div>
        <div className={s.CheckBoxFilter}>
          Бизнес
          <Input type="checkbox" checked={filters.categories.business} onChange={() => handleCategoryChange('business')} id="business-filter"/>
        </div>
      </div>
      <div className={s.PriceFilter}>
        <div className={s.PriceFilterInput}>
          Стоимость {"<"} <span>{formatPrice(filters.price.maxPrice)}</span>
          <Input type="range" min={0} max={maxOrderPrice} step={10} value={filters.price.maxPrice} onChange={(e) => handlePriceChange(Number(e.target.value))}/>
        </div>
      </div>
    </div>
    <div className={s.Wrapper}>
      {
        filteredOrders.map((drive, _key) => (
            <div className={s.Order}><OrderCard key={_key}  cardData={drive}/></div>
        ))
      }
    </div>
    </>
  )
}

export {DrivesList}