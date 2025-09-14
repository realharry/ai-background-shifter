import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { SidePanel } from './components/SidePanel'

ReactDOM.createRoot(document.getElementById('sidepanel-root')!).render(
  <React.StrictMode>
    <SidePanel />
  </React.StrictMode>,
)