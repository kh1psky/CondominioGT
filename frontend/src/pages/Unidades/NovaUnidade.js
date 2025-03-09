import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

const NovaUnidade = () => {
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

  // Esquema de validação
  const validationSchema = Yup.object({
    condominio_id: Yup.string().required('Condomínio é obrigatório'),
    numero: Yup.string().required('Número é obrigatório'),
    bloco: Yup.string(),
    area_total: Yup.number()
      .typeError('Área deve ser um número')
      .positive('Área deve ser positiva')
      .required('Área total é obrigatória'),
    quartos: Yup.number()
      .typeError('Número de quartos deve ser um número')
      .integer('Número de quartos deve ser um número inteiro')
      .min(0, 'Número de quartos não pode ser negativo'),
    banheiros: Yup.number()
      .typeError('Número de banheiros deve ser um número')
      .integer('Número de banheiros deve ser um número inteiro')
      .min(0, 'Número de banheiros não pode ser negativo'),
    vagas_garagem: Yup.number()
      .typeError('Número de vagas deve ser um número')
      .integer('Número de vagas deve ser um número inteiro')
      .min(0, 'Número de vagas não pode ser negativo'),
    status: Yup.string().required('Status é obrigatório'),
    observacoes: Yup.string()
  });

  // Valores iniciais do formulário
  const initialValues = {
    condominio_id: '',
    numero: '',
    bloco: '',
    area_total: '',
    quartos: '',
    banheiros: '',
    vagas_garagem: '',
    status: 'vago',
    observacoes: ''
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const response = await api.post('/unidades', values);
      
      if (response.data.success) {
        toast.success('Unidade criada com sucesso!');
        navigate('/app/unidades');
      } else {
        toast.error(response.data.message || 'Falha ao criar unidade');
      }
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
      toast.error('Erro ao criar unidade. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nova Unidade</h1>
        <p className="text-gray-600 mt-1">Preencha os dados para cadastrar uma nova unidade</p>
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
              {({ isSubmitting, errors, touched }) => (
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

                  {/* Número e Bloco */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                        Número da Unidade *
                      </label>
                      <Field
                        type="text"
                        id="numero"
                        name="numero"
                        className={`form-input w-full ${errors.numero && touched.numero ? 'border-red-500' : ''}`}
                        placeholder="Ex: 101"
                      />
                      <ErrorMessage name="numero" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <label htmlFor="bloco" className="block text-sm font-medium text-gray-700 mb-1">
                        Bloco
                      </label>
                      <Field
                        type="text"
                        id="bloco"
                        name="bloco"
                        className="form-input w-full"
                        placeholder="Ex: A"
                      />
                      <ErrorMessage name="bloco" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Área e Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="area_total" className="block text-sm font-medium text-gray-700 mb-1">
                        Área Total (m²) *
                      </label>
                      <Field
                        type="number"
                        id="area_total"
                        name="area_total"
                        className={`form-input w-full ${errors.area_total && touched.area_total ? 'border-red-500' : ''}`}
                        placeholder="Ex: 75.5"
                        step="0.01"
                      />
                      <ErrorMessage name="area_total" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
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
                        <option value="vago">Vago</option>
                        <option value="ocupado">Ocupado</option>
                        <option value="em_reforma">Em Reforma</option>
                        <option value="indisponivel">Indisponível</option>
                      </Field>
                      <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Quartos, Banheiros e Vagas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="quartos" className="block text-sm font-medium text-gray-700 mb-1">
                        Quartos
                      </label>
                      <Field
                        type="number"
                        id="quartos"
                        name="quartos"
                        className={`form-input w-full ${errors.quartos && touched.quartos ? 'border-red-500' : ''}`}
                        placeholder="Ex: 2"
                        min="0"
                      />
                      <ErrorMessage name="quartos" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <label htmlFor="banheiros" className="block text-sm font-medium text-gray-700 mb-1">
                        Banheiros
                      </label>
                      <Field
                        type="number"
                        id="banheiros"
                        name="banheiros"
                        className={`form-input w-full ${errors.banheiros && touched.banheiros ? 'border-red-500' : ''}`}
                        placeholder="Ex: 1"
                        min="0"
                      />
                      <ErrorMessage name="banheiros" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <label htmlFor="vagas_garagem" className="block text-sm font-medium text-gray-700 mb-1">
                        Vagas de Garagem
                      </label>
                      <Field
                        type="number"
                        id="vagas_garagem"
                        name="vagas_garagem"
                        className={`form-input w-full ${errors.vagas_garagem && touched.vagas_garagem ? 'border-red-500' : ''}`}
                        placeholder="Ex: 1"
                        min="0"
                      />
                      <ErrorMessage name="vagas_garagem" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
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
                      placeholder="Informações adicionais sobre a unidade"
                    />
                    <ErrorMessage name="observacoes" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Botões */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/app/unidades')}
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

export default NovaUnidade;