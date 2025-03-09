import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

const NovaTransacao = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [condominios, setCondominios] = useState([]);
  const [loadingCondominios, setLoadingCondominios] = useState(true);

  // Buscar lista de condomínios
  useEffect(() => {
    const fetchCondominios = async () => {
      try {
        const response = await api.get('/condominios', {
          params: { limit: 100 } // Buscar todos para o select
        });
        
        if (response.data.success) {
          setCondominios(response.data.data);
        } else {
          toast.error(response.data.message || 'Falha ao carregar condomínios');
        }
      } catch (error) {
        console.error('Erro ao carregar condomínios:', error);
        toast.error('Erro ao carregar lista de condomínios');
      } finally {
        setLoadingCondominios(false);
      }
    };

    fetchCondominios();
  }, []);

  // Categorias de transações
  const categorias = {
    receita: [
      'Aluguel',
      'Taxa de condomínio',
      'Multas',
      'Juros',
      'Reserva',
      'Outros'
    ],
    despesa: [
      'Manutenção',
      'Limpeza',
      'Segurança',
      'Água',
      'Energia',
      'Gás',
      'Internet',
      'Telefone',
      'Impostos',
      'Seguros',
      'Salários',
      'Material de escritório',
      'Outros'
    ]
  };

  // Esquema de validação
  const validationSchema = Yup.object({
    condominio_id: Yup.string().required('Condomínio é obrigatório'),
    descricao: Yup.string().required('Descrição é obrigatória'),
    valor: Yup.number()
      .typeError('Valor deve ser um número')
      .positive('Valor deve ser positivo')
      .required('Valor é obrigatório'),
    tipo: Yup.string().required('Tipo é obrigatório'),
    categoria: Yup.string().required('Categoria é obrigatória'),
    data: Yup.date().required('Data é obrigatória'),
    status: Yup.string().required('Status é obrigatório'),
    observacoes: Yup.string()
  });

  // Valores iniciais do formulário
  const initialValues = {
    condominio_id: '',
    descricao: '',
    valor: '',
    tipo: 'receita',
    categoria: '',
    data: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
    status: 'pago',
    observacoes: ''
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const response = await api.post('/financeiro/transacoes', values);
      
      if (response.data.success) {
        toast.success('Transação registrada com sucesso!');
        navigate('/app/financeiro');
      } else {
        toast.error(response.data.message || 'Falha ao registrar transação');
      }
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      toast.error('Erro ao registrar transação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nova Transação</h1>
        <p className="text-gray-600 mt-1">Preencha os dados para registrar uma nova transação financeira</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {loadingCondominios ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                <Form className="space-y-6">
                  {/* Condomínio */}
                  <div>
                    <label htmlFor="condominio_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Condomínio *
                    </label>
                    <Field
                      as="select"
                      id="condominio_id"
                      name="condominio_id"
                      className={`form-input w-full ${errors.condominio_id && touched.condominio_id ? 'border-red-500' : ''}`}
                    >
                      <option value="">Selecione um condomínio</option>
                      {condominios.map(cond => (
                        <option key={cond.id} value={cond.id}>{cond.nome}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="condominio_id" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Tipo e Categoria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo *
                      </label>
                      <Field
                        as="select"
                        id="tipo"
                        name="tipo"
                        className={`form-input w-full ${errors.tipo && touched.tipo ? 'border-red-500' : ''}`}
                        onChange={(e) => {
                          const novoTipo = e.target.value;
                          setFieldValue('tipo', novoTipo);
                          setFieldValue('categoria', ''); // Resetar categoria quando mudar o tipo
                        }}
                      >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </Field>
                      <ErrorMessage name="tipo" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria *
                      </label>
                      <Field
                        as="select"
                        id="categoria"
                        name="categoria"
                        className={`form-input w-full ${errors.categoria && touched.categoria ? 'border-red-500' : ''}`}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categorias[values.tipo].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="categoria" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <Field
                      type="text"
                      id="descricao"
                      name="descricao"
                      className={`form-input w-full ${errors.descricao && touched.descricao ? 'border-red-500' : ''}`}
                      placeholder="Ex: Pagamento de taxa de condomínio"
                    />
                    <ErrorMessage name="descricao" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Valor e Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                        Valor (R$) *
                      </label>
                      <Field
                        type="number"
                        id="valor"
                        name="valor"
                        className={`form-input w-full ${errors.valor && touched.valor ? 'border-red-500' : ''}`}
                        placeholder="Ex: 1500.00"
                        step="0.01"
                      />
                      <ErrorMessage name="valor" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                        Data *
                      </label>
                      <Field
                        type="date"
                        id="data"
                        name="data"
                        className={`form-input w-full ${errors.data && touched.data ? 'border-red-500' : ''}`}
                      />
                      <ErrorMessage name="data" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <Field
                      as="select"
                      id="status"
                      name="status"
                      className={`form-input w-full ${errors.status && touched.status ? 'border-red-500' : ''}`}
                    >
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                      <option value="cancelado">Cancelado</option>
                    </Field>
                    <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Observações */}
                  <div>
                    <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                      Observações
                    </label>
                    <Field
                      as="textarea"
                      id="observacoes"
                      name="observacoes"
                      rows="4"
                      className="form-input w-full"
                      placeholder="Informações adicionais sobre a transação"
                    />
                    <ErrorMessage name="observacoes" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/app/financeiro')}
                      className="btn-secondary"
                      disabled={isSubmitting || loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Salvando...
                        </>
                      ) : 'Salvar'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovaTransacao;