import { Navigate, Route, Routes } from "react-router-dom"
import { APP_ROUTES, Info } from "../shared"
import { Auth } from "../user"
import { Account } from "../user/pages"
import { Personal } from "../user/pages/Personal/Personal"
import { OrderManager } from "../user/pages/OrderManager"
import { DriverAuth, DriverAccount } from "../driver/pages"
import { DriverPersonal } from "../driver/pages/Personal/DriverPersonal"
import { StuffAuth, StuffAccount } from "../stuff/pages"
import { useAppSelector } from "../store/store"
import { useEffect, useState } from "react"
import { TicketsManager } from "../user/pages/TicketsManager"

const AppRoutes = () => {
  const { isAuthenticated, AccessToken } = useAppSelector(state => state.auth)

  const [canAccess, setCanAccess] = useState<boolean>(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
        const token = localStorage.getItem("access_token")
        setCanAccess(!!token)
    }
    setCanAccess(isAuthenticated)
  }, [isAuthenticated, AccessToken])

  return (
    <Routes>
      <Route path={APP_ROUTES.home} element={<Navigate to={APP_ROUTES.info} replace />}/>
      <Route path={APP_ROUTES.info} element={<Info />}/>
      {
        canAccess ? (
          <>
            <Route path={APP_ROUTES.userAccount} element={<Account/>}/>
            <Route path={APP_ROUTES.userPersonal} element={<Personal/>}/>
            <Route path={APP_ROUTES.userOrderManager} element={<OrderManager/>}/>
            <Route path={APP_ROUTES.userTicketManager} element={<TicketsManager/>}/>
            <Route path={APP_ROUTES.userAuth} element={<Navigate to={APP_ROUTES.userAccount} replace />}/>
            <Route path={APP_ROUTES.driverAccount} element={<DriverAccount/>}/>
            <Route path={APP_ROUTES.driverPersonal} element={<DriverPersonal/>}/>
            <Route path={APP_ROUTES.driverAuth} element={<Navigate to={APP_ROUTES.driverAccount} replace />}/>
            <Route path={APP_ROUTES.stuffAccount} element={<StuffAccount/>}/>
            <Route path={APP_ROUTES.stuffAuth} element={<Navigate to={APP_ROUTES.stuffAccount} replace />}/>
          </>
        ) : (
          <>
            <Route path={APP_ROUTES.userAuth} element={<Auth/>}/>
            <Route path={APP_ROUTES.userAccount} element={<Navigate to={APP_ROUTES.userAuth} replace />}/>
            <Route path={APP_ROUTES.userPersonal} element={<Navigate to={APP_ROUTES.userAuth} replace />}/>
            <Route path={APP_ROUTES.userOrderManager} element={<Navigate to={APP_ROUTES.userAuth} replace />}/>
            <Route path={APP_ROUTES.userTicketManager} element={<Navigate to={APP_ROUTES.userAuth} replace />}/>
            <Route path={APP_ROUTES.driverAuth} element={<DriverAuth/>}/>
            <Route path={APP_ROUTES.driverAccount} element={<Navigate to={APP_ROUTES.driverAuth} replace />}/>
            <Route path={APP_ROUTES.driverPersonal} element={<Navigate to={APP_ROUTES.driverAuth} replace />}/>
            <Route path={APP_ROUTES.stuffAuth} element={<StuffAuth/>}/>
            <Route path={APP_ROUTES.stuffAccount} element={<Navigate to={APP_ROUTES.stuffAuth} replace />}/>
          </>
        )
      }
      <Route path="*" element={<Navigate to={APP_ROUTES.info} replace />}/>
    </Routes>
  )
}

export { AppRoutes }