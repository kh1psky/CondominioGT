import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

// Esquema de validação para informações pessoais
const PerfilSchema = Yup.object().shape({
  nome: Yup.string()
    .min(3, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .required('O nome é obrigatório'),
  telefone: Yup.string()
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX')
    .required('O telefone é obrigatório')
});

// Esquema de validação para alterar senha
const SenhaSchema = Yup.object().shape({
  senhaAtual: Yup.string()
    .required('A senha atual é obrigatória'),
  novaSenha: Yup.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .required('A nova senha é obrigatória'),
  confirmarSenha: Yup.string()
    .oneOf([Yup.ref('novaSenha'), null], 'As senhas não coincidem')
    .required('A confirmação de senha é obrigatória')
});

const Perfil = () => {
  const { user, updateProfile } = useAuth();
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Função para formatar a data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handler para atualizar informações pessoais
  const handleUpdateInfo = async (values) => {
    setLoadingInfo(true);
    
    try {
      const result = await updateProfile({
        nome: values.nome,
        telefone: values.telefone
      });
      
      if (result.success) {
        toast.success('Perfil atualizado com sucesso!');
      } else {
        toast.error(result.message || 'Falha ao atualizar perfil.');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente mais tarde.');
    } finally {
      setLoadingInfo(false);
    }
  };

  // Handler para alterar senha
  const handleChangePassword = async (values, { resetForm }) => {
    setLoadingSenha(true);
    
    try {
      // Aqui você implementaria a chamada à API para alteração de senha
      // Por enquanto, apenas simularemos o sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Senha alterada com sucesso!');
      resetForm();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha. Tente novamente mais tarde.');
    } finally {
      setLoadingSenha(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Meu Perfil</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('info')}
            className={`${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm mr-8`}
          >
            Informações Pessoais
          </button>
          <button
            onClick={() => setActiveTab('senha')}
            className={`${
              activeTab === 'senha'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm mr-8`}
          >
            Alterar Senha
          </button>
          <button
            onClick={() => setActiveTab('preferencias')}
            className={`${
              activeTab === 'preferencias'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Preferências
          </button>
        </nav>
      </div>

      {/* Conteúdo do Tab Selecionado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna da Esquerda - Sempre visível */}
        <div className="md:col-span-1">
          <div className="card flex flex-col items-center p-6">
            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-3xl font-semibold uppercase mb-4">
              {user?.nome?.charAt(0) || 'U'}
            </div>
            <h3 className="text-lg font-medium text-gray-900">{user?.nome}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
              {user?.perfil === 'admin' ? 'Administrador' : 
                user?.perfil === 'sindico' ? 'Síndico' : 
                user?.perfil === 'funcionario' ? 'Funcionário' : 'Morador'}
            </div>
            <div className="w-full mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium text-success-600">Ativo</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Último acesso:</span>
                <span className="font-medium">{formatDate(user?.ultimo_acesso)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cadastrado em:</span>
                <span className="font-medium">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Direita - Conteúdo da Tab */}
        <div className="md:col-span-2">
          {/* Tab de Informações Pessoais */}
          {activeTab === 'info' && (
            <div className="card p-6">
              <h2 className="section-title">Informações Pessoais</h2>
              <Formik
                initialValues={{
                  nome: user?.nome || '',
                  email: user?.email || '',
                  telefone: user?.telefone || ''
                }}
                validationSchema={PerfilSchema}
                onSubmit={handleUpdateInfo}
                enableReinitialize
              >
                {({ errors, touched }) => (
                  <Form className="space-y-4 mt-4">
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
                        disabled
                        className="form-input bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        O email não pode ser alterado.
                      </p>
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

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loadingInfo}
                      >
                        {loadingInfo ? (
                          <span className="flex items-center">
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
                            Salvando...
                          </span>
                        ) : (
                          'Salvar Alterações'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* Tab de Alterar Senha */}
          {activeTab === 'senha' && (
            <div className="card p-6">
              <h2 className="section-title">Alterar Senha</h2>
              <Formik
                initialValues={{
                  senhaAtual: '',
                  novaSenha: '',
                  confirmarSenha: ''
                }}
                validationSchema={SenhaSchema}
                onSubmit={handleChangePassword}
              >
                {({ errors, touched }) => (
                  <Form className="space-y-4 mt-4">
                    <div>
                      <label htmlFor="senhaAtual" className="form-label">
                        Senha Atual
                      </label>
                      <Field
                        id="senhaAtual"
                        name="senhaAtual"
                        type="password"
                        className={`form-input ${
                          errors.senhaAtual && touched.senhaAtual ? 'border-danger-500' : ''
                        }`}
                      />
                      <ErrorMessage
                        name="senhaAtual"
                        component="div"
                        className="form-error"
                      />
                    </div>

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
                      <p className="text-xs text-gray-500 mt-1">
                        A senha deve ter pelo menos 6 caracteres.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="confirmarSenha" className="form-label">
                        Confirmar Nova Senha
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

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loadingSenha}
                      >
                        {loadingSenha ? (
                          <span className="flex items-center">
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
                            Alterando...
                          </span>
                        ) : (
                          'Alterar Senha'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* Tab de Preferências */}
          {activeTab === 'preferencias' && (
            <div className="card p-6">
              <h2 className="section-title">Preferências</h2>
              <div className="mt-4">
                {/* Preferências de Notificações */}
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Notificações por Email
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="notif-pagamentos"
                      name="notif-pagamentos"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="notif-pagamentos" className="ml-3 text-sm text-gray-700">
                      Pagamentos e cobrança
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="notif-manutencao"
                      name="notif-manutencao"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="notif-manutencao" className="ml-3 text-sm text-gray-700">
                      Manutenções e serviços
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="notif-documentos"
                      name="notif-documentos"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="notif-documentos" className="ml-3 text-sm text-gray-700">
                      Novos documentos e avisos
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="notif-eventos"
                      name="notif-eventos"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="notif-eventos" className="ml-3 text-sm text-gray-700">
                      Eventos e reuniões
                    </label>
                  </div>
                </div>

                {/* Preferências de Exibição */}
                <h3 className="text-sm font-medium text-gray-700 mt-6 mb-3">
                  Exibição
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="theme-system"
                      name="theme"
                      type="radio"
                      defaultChecked
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="theme-system" className="ml-3 text-sm text-gray-700">
                      Usar configuração do sistema
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="theme-light"
                      name="theme"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="theme-light" className="ml-3 text-sm text-gray-700">
                      Modo claro
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="theme-dark"
                      name="theme"
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="theme-dark" className="ml-3 text-sm text-gray-700">
                      Modo escuro
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <button type="button" className="btn-primary">
                    Salvar Preferências
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;