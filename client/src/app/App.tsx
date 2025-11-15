import { BrowserRouter as Router } from 'react-router-dom'
import './App.scss'
import { Provider } from 'react-redux'
import { persistor, store } from '../store/store'
import { AppRoutes } from './AppRoutes'
import { PersistGate } from 'redux-persist/integration/react'

function App() {

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <Router>
          <AppRoutes/>
        </Router>
      </PersistGate>
    </Provider>
  )
}

export default App
