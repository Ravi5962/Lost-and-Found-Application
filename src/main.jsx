import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="min-h-screen bg-bg-950 text-slate-100">
      <App />
    </div>
  </React.StrictMode>
)
