import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { api } from '../../services/api';

const EditarUnidade = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unidade, setUnidade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [condominios, setCondominios] = useState([]);

  // Buscar dados da unidade e lista de condomínios
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados da unidade
        const unidadeResponse = await api.get(`/unidades/${id}`);
        
        if (!unidadeResponse.data.success) {
          toast.error(unidadeResponse.data.message || 'Falha ao carregar dados da unidade');
          navigate('/app/unidades');
          return;
        }
        
        setUnidade(unidadeResponse.data.data);
        
        // Buscar lista de condomínios
        const condominiosResponse = await api.get('/condominios', {
          params: { limit: 100 }
        });
        
        if (condominiosResponse.data.success) {
          setCondominios(condominiosResponse.data.data);
        } else {
          toast.error(condominiosResponse.data.message || 'Falha ao carregar condomínios');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados. Tente novamente mais tarde.');
        navigate('/app/unidades');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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

  // Função para lidar com o envio do formulário
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await api.put(`/unidades/${id}`, values);
      
      if (response.data.success) {
        toast.success('Unidade atualizada com sucesso!');
        navigate(`/app/unidades/${id}`);
      } else {
        toast.error(response.data.message || 'Falha ao atualizar unidade');
      }
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast.error('Erro ao atualizar unidade. Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!unidade) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Unidade não encontrada.</p>
          <button 
            onClick={() => navigate('/app/unidades')} 
            className="text-blue-600 hover:text-blue-800 mt-4"
          >
            Voltar para lista de unidades
          </button>
        </div>
      </div>
    );
  }

  // Valores iniciais do formulário
  const initialValues = {
    condominio_id: unidade.condominio_id || '',
    numero: unidade.numero || '',
    bloco: unidade.bloco || '',
    area_total: unidade.area_total || '',
    quartos: unidade.quartos || '',
    banheiros: unidade.banheiros || '',
    vagas_garagem: unidade.vagas_garagem || '',
    status: unidade.status || 'vago',
    observacoes: unidade.observacoes || ''
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editar Unidade</h1>
        <p className="text-gray-600 mt-1">
          {unidade.bloco ? `Bloco ${unidade.bloco} - ` : ''}Unidade {unidade.numero}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
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
                    onClick={() => navigate(`/app/unidades/${id}`)}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
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
        </div>
      </div>
    </div>
  );
};

export default EditarUnidade;