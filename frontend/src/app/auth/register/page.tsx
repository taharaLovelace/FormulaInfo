/**
 * @fileoverview Página de Registro
 * @description Página de cadastro que exibe o formulário de registro de novos usuários.
 * Utiliza PublicRoute para redirecionar usuários já autenticados.
 */

import RegisterForm from '../../../components/auth/RegisterForm';
import PublicRoute from '../../../components/auth/PublicRoute';

/**
 * Página de registro do FormulaInfo.
 * 
 * @description Renderiza o formulário de registro dentro de uma rota pública.
 * Usuários já autenticados são automaticamente redirecionados
 * para a página inicial pelo componente PublicRoute.
 * 
 * @returns {JSX.Element} Página de registro com formulário
 */
export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterForm />
    </PublicRoute>
  );
}