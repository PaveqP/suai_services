import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.scss'
import { APP_ROUTES } from '../shared'
import { Info } from '../shared'
import { Auth } from '../user'
import { Provider } from 'react-redux'
import { store } from '../store/store'

function App() {

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path={APP_ROUTES.home} element={<Navigate to={APP_ROUTES.info} replace />}/>
          <Route path={APP_ROUTES.info} element={<Info></Info>}></Route>

          <Route path={APP_ROUTES.userAuth} element={<Auth/>}/>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
