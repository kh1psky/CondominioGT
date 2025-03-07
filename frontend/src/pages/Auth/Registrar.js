import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

// Esquema de validação
const RegistroSchema = Yup.object().shape({
  nome: Yup.string()
    .min(3, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .required('O nome é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('O email é obrigatório'),
  senha: Yup.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .required('A senha é obrigatória'),
  confirmacaoSenha: Yup.string()
    .oneOf([Yup.ref('senha'), null], 'As senhas não coincidem')
    .required('A confirmação de senha é obrigatória'),
  telefone: Yup.string()
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX')
    .required('O telefone é obrigatório'),
  perfil: Yup.string()
    .required('O perfil é obrigatório')
});

const Registrar = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Remover a confirmação de senha antes de enviar
      const { confirmacaoSenha, ...userData } = values;
      
      const result = await register(userData);
      
      if (result.success) {
        toast.success('Registro realizado com sucesso! Faça login para continuar.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Falha ao registrar. Verifique os dados e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast.error('Erro ao registrar. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Conta</h2>
      
      <Formik
        initialValues={{
          nome: '',
          email: '',
          senha: '',
          confirmacaoSenha: '',
          telefone: '',
          perfil: 'morador'
        }}
        validationSchema={RegistroSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form className="space-y-4">
            <div>
              <label htmlFor="nome" className="form-label">
                Nome Completo
              </label>
              <Field
                id="nome"
                name="nome"
                type="text"
                className={`form-input ${
                  errors.nome && touched.nome ? 'border-danger-500' : ''
                }`}
                placeholder="Seu nome completo"
              />
              <ErrorMessage
                name="nome"
                component="div"
                className="form-error"
              />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="senha" className="form-label">
                  Senha
                </label>
                <Field
                  id="senha"
                  name="senha"
                  type="password"
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
                <label htmlFor="confirmacaoSenha" className="form-label">
                  Confirmar Senha
                </label>
                <Field
                  id="confirmacaoSenha"
                  name="confirmacaoSenha"
                  type="password"
                  className={`form-input ${
                    errors.confirmacaoSenha && touched.confirmacaoSenha ? 'border-danger-500' : ''
                  }`}
                />
                <ErrorMessage
                  name="confirmacaoSenha"
                  component="div"
                  className="form-error"
                />
              </div>
            </div>

            <div>
              <label htmlFor="telefone" className="form-label">
                Telefone
              </label>
              <Field
                id="telefone"
                name="telefone"
                type="text"
                className={`form-input ${
                  errors.telefone && touched.telefone ? 'border-danger-500' : ''
                }`}
                placeholder="(XX) XXXXX-XXXX"
              />
              <ErrorMessage
                name="telefone"
                component="div"
                className="form-error"
              />
            </div>

            <div>
              <label htmlFor="perfil" className="form-label">
                Perfil
              </label>
              <Field
                as="select"
                id="perfil"
                name="perfil"
                className={`form-input ${
                  errors.perfil && touched.perfil ? 'border-danger-500' : ''
                }`}
              >
                <option value="morador">Morador</option>
                <option value="sindico">Síndico</option>
                <option value="funcionario">Funcionário</option>
              </Field>
              <ErrorMessage
                name="perfil"
                component="div"
                className="form-error"
              />
            </div>

            <div className="pt-2">
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
                    Registrando...
                  </span>
                ) : (
                  'Registrar'
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{' '}
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

export default Registrar;