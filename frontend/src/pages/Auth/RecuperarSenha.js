import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

// Esquema de validação
const RecuperarSenhaSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('O email é obrigatório')
});

const RecuperarSenha = () => {
  const { recoverPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const result = await recoverPassword(values.email);
      
      if (result.success) {
        setSuccess(true);
        toast.success('Instruções de recuperação enviadas para o seu email!');
      } else {
        toast.error(result.message || 'Falha ao solicitar recuperação de senha.');
      }
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      toast.error('Erro ao solicitar recuperação de senha. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recuperação de Senha</h2>
        
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Instruções de recuperação enviadas para seu email
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Enviamos um link para você redefinir sua senha. Por favor, verifique
          sua caixa de entrada e siga as instruções contidas no email.
        </p>
        
        <div className="flex justify-center">
          <Link to="/login" className="btn-primary">
            Voltar ao Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recuperar Senha</h2>
      
      <p className="text-gray-600 mb-6">
        Digite seu email abaixo e enviaremos instruções para redefinir sua senha.
      </p>
      
      <Formik
        initialValues={{ email: '' }}
        validationSchema={RecuperarSenhaSchema}
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
                    Enviando...
                  </span>
                ) : (
                  'Enviar Instruções'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Lembrou sua senha?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RecuperarSenha;