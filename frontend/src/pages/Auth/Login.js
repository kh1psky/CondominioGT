import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

// Esquema de validação
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('O email é obrigatório'),
  senha: Yup.string()
    .required('A senha é obrigatória')
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const result = await login(values.email, values.senha);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/app');
      } else {
        toast.error(result.message || 'Falha ao fazer login. Verifique suas credenciais.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao fazer login. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrar</h2>
      
      <Formik
        initialValues={{ email: '', senha: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`form-input ${
                  errors.email && touched.email ? 'border-danger-500' : ''
                }`}
                placeholder="seu.email@exemplo.com"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="form-error"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="senha" className="form-label">
                  Senha
                </label>
                <div className="text-sm">
                  <Link
                    to="/recuperar-senha"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              <Field
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                className={`form-input ${
                  errors.senha && touched.senha ? 'border-danger-500' : ''
                }`}
              />
              <ErrorMessage
                name="senha"
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
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link
            to="/registrar"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;