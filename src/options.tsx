import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { OptionsPage } from './components/OptionsPage'

ReactDOM.createRoot(document.getElementById('options-root')!).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>,
)