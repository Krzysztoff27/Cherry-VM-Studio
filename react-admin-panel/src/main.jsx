import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Loading from './components/atoms/feedback/Loading/Loading.tsx';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import '@mantine/core/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import '@mantine/charts/styles.layer.css';
import './main.css';

import theme from './config/mantineTheme.js';
import './config/i18next.js';


ReactDOM.createRoot(document.getElementById('root')).render(
  <MantineProvider theme={theme} defaultColorScheme="dark">
    <Notifications />
    <React.StrictMode>
      <React.Suspense fallback={<Loading/>}>
        <App />
      </React.Suspense>
    </React.StrictMode>
  </MantineProvider>,
)
