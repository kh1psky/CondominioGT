import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

// Esquema de validação
const RedefinirSenhaSchema = Yup.object().shape({
  novaSenha: Yup.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .required('A nova senha é obrigatória'),
  confirmarSenha: Yup.string()
    .oneOf([Yup.ref('novaSenha'), null], 'As senhas não coincidem')
    .required('A confirmação de senha é obrigatória')
});

const RedefinirSenha = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  // Extrair token da URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setInvalidToken(true);
    }
  }, [location]);

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const result = await resetPassword(token, values.novaSenha);
      
      if (result.success) {
        toast.success('Senha redefinida com sucesso!');
        navigate('/login');
      } else {
        toast.error(result.message || 'Falha ao redefinir senha.');
        if (result.message === 'Token inválido ou expirado') {
          setInvalidToken(true);
        }
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      toast.error('Erro ao redefinir senha. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Link Inválido</h2>
        
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                O link de redefinição de senha é inválido ou expirou
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Por favor, solicite um novo link de redefinição de senha.
        </p>
        
        <div className="flex justify-center">
          <Link to="/recuperar-senha" className="btn-primary">
            Solicitar Novo Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Redefinir Senha</h2>
      
      <p className="text-gray-600 mb-6">
        Digite sua nova senha abaixo para concluir o processo de redefinição.
      </p>
      
      <Formik
        initialValues={{ novaSenha: '', confirmarSenha: '' }}
        validationSchema={RedefinirSenhaSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="novaSenha" className="form-label">
                Nova Senha
              </label>
              <Field
                id="novaSenha"
                name="novaSenha"
                type="password"
                className={`form-input ${
                  errors.novaSenha && touched.novaSenha ? 'border-danger-500' : ''
                }`}
              />
              <ErrorMessage
                name="novaSenha"
                component="div"
                className="form-error"
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="form-label">
                Confirmar Senha
              </label>
              <Field
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                className={`form-input ${
                  errors.confirmarSenha && touched.confirmarSenha ? 'border-danger-500' : ''
                }`}
              />
              <ErrorMessage
                name="confirmarSenha"
                component="div"
                className="form-error"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Redefinindo...
                  </span>
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Voltar ao Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RedefinirSenha;