/**
 * @fileoverview Página de Login
 * @description Página de autenticação que exibe o formulário de login.
 * Utiliza PublicRoute para redirecionar usuários já autenticados.
 */

import LoginForm from '../../../components/auth/LoginForm';
import PublicRoute from '../../../components/auth/PublicRoute';

/**
 * Página de login do FormulaInfo.
 * 
 * @description Renderiza o formulário de login dentro de uma rota pública.
 * Usuários já autenticados são automaticamente redirecionados
 * para a página inicial pelo componente PublicRoute.
 * 
 * @returns {JSX.Element} Página de login com formulário
 */
export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  );
}