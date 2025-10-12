import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import './index.css';

// 1. Aqui definimos as "regras de trânsito" do nosso site
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);

// 2. Aqui iniciamos a aplicação usando o roteador
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);