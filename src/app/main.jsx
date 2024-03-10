import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './App.jsx'
import {appStarted} from '~/shared/config/init';
import './index.css'

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

//запускаем событие о старте приложения
appStarted();
//рендерим основной компонент на странице
root.render(<React.StrictMode><App /></React.StrictMode>);
