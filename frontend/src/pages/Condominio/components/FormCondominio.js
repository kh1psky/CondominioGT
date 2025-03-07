import React, { useState, useEffect } from 'react';
import { Form, Field, ErrorMessage, FieldArray } from 'formik';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { api } from '../../../services/api';

// Lista de estados brasileiros
const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const FormCondominio = ({ formik, loading, isEditing = false }) => {
  const [sindicos, setSindicos] = useState([]);
  const [loadingSindicos, setLoadingSindicos] = useState(false);
  const [activeTab, setActiveTab] = useState('infoBásicas');

  // Buscar lista de síndicos
  useEffect(() => {
    const fetchSindicos = async () => {
      setLoadingSindicos(true);
      try {
        const response = await api.get('/usuarios', {
          params: {
            perfil: 'sindico'
          }
        });
        
        if (response.data.success !== false) {
          setSindicos(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar síndicos:', error);
        toast.error('Erro ao carregar lista de síndicos');
      } finally {
        setLoadingSindicos(false);
      }
    };

    fetchSindicos();
  }, []);

  // Função para formatar CNPJ automaticamente
  const formatCNPJ = (value) => {
    if (!value) return value;
    
    // Remove caracteres não numéricos
    const cnpj = value.replace(/\D/g, '');
    
    // Aplica a máscara do CNPJ (XX.XXX.XXX/XXXX-XX)
    return cnpj
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  // Função para formatar CEP automaticamente
  const formatCEP = (value) => {
    if (!value) return value;
    
    // Remove caracteres não numéricos
    const cep = value.replace(/\D/g, '');
    
    // Aplica a máscara do CEP (XXXXX-XXX)
    return cep
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  // Função para formatar telefone automaticamente
  const formatTelefone = (value) => {
    if (!value) return value;
    
    // Remove caracteres não numéricos
    const telefone = value.replace(/\D/g, '');
    
    // Aplica a máscara do telefone ((XX) XXXXX-XXXX)
    return telefone
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  // Função para buscar endereço pelo CEP
  const buscarCEP = async (cep) => {
    if (cep.length < 9) return; // CEP incompleto
    
    try {
      formik.setFieldValue('buscandoCEP', true);
      
      const cepLimpo = cep.replace(/\D/g, '');
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      
      if (!response.data.erro) {
        formik.setFieldValue('endereco', response.data.logradouro || '');
        formik.setFieldValue('bairro', response.data.bairro || '');
        formik.setFieldValue('cidade', response.data.localidade || '');
        formik.setFieldValue('estado', response.data.uf || '');
      } else {
        toast.warning('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar informações do CEP');
    } finally {
      formik.setFieldValue('buscandoCEP', false);
    }
  };

  // Componente de campo com label e erro
  const FormField = ({ label, name, type = 'text', placeholder = '', ...props }) => (
    <div className="mb-4">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`form-input ${
          formik.errors[name] && formik.touched[name] ? 'border-danger-500' : ''
        }`}
        {...props}
      />
      <ErrorMessage
        name={name}
        component="div"
        className="form-error"
      />
    </div>
  );

  return (
    <Form>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            type="button"
            onClick={() => setActiveTab('infoBásicas')}
            className={`${
              activeTab === 'infoBásicas'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
          >
            Informações Básicas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('endereco')}
            className={`${
              activeTab === 'endereco'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
          >
            Endereço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contato')}
            className={`${
              activeTab === 'contato'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
          >
            Contato
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setActiveTab('unidades')}
              className={`${
                activeTab === 'unidades'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
            >
              Unidades Iniciais
            </button>
          )}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="p-6">
        {/* Informações Básicas */}
        {activeTab === 'infoBásicas' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField 
                  label="Nome do Condomínio" 
                  name="nome" 
                  placeholder="Ex: Residencial Parque das Flores"
                />
              </div>
              <div>
                <label htmlFor="cnpj" className="form-label">
                  CNPJ
                </label>
                <Field
                  id="cnpj"
                  name="cnpj"
                  className={`form-input ${
                    formik.errors.cnpj && formik.touched.cnpj ? 'border-danger-500' : ''
                  }`}
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  disabled={isEditing} // CNPJ não pode ser editado
                  onChange={(e) => {
                    const formatted = formatCNPJ(e.target.value);
                    formik.setFieldValue('cnpj', formatted);
                  }}
                />
                <ErrorMessage
                  name="cnpj"
                  component="div"
                  className="form-error"
                />
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    O CNPJ não pode ser alterado após o cadastro.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <FormField 
                  label="Data de Fundação" 
                  name="data_fundacao" 
                  type="date"
                />
              </div>
              <div>
                <FormField 
                  label="Área Total (m²)" 
                  name="area_total" 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="Ex: 1500.50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="sindico_id" className="form-label">
                Síndico Responsável
              </label>
              <Field
                as="select"
                id="sindico_id"
                name="sindico_id"
                className={`form-input ${
                  formik.errors.sindico_id && formik.touched.sindico_id ? 'border-danger-500' : ''
                }`}
                disabled={loadingSindicos}
              >
                <option value="">Selecione um síndico...</option>
                {sindicos.map((sindico) => (
                  <option key={sindico.id} value={sindico.id}>
                    {sindico.nome} ({sindico.email})
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="sindico_id"
                component="div"
                className="form-error"
              />
              {loadingSindicos && (
                <p className="text-xs text-gray-500 mt-1">
                  Carregando síndicos...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Endereço */}
        {activeTab === 'endereco' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cep" className="form-label">
                  CEP
                </label>
                <div className="flex">
                  <Field
                    id="cep"
                    name="cep"
                    className={`form-input ${
                      formik.errors.cep && formik.touched.cep ? 'border-danger-500' : ''
                    }`}
                    placeholder="XXXXX-XXX"
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value);
                      formik.setFieldValue('cep', formatted);
                    }}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      buscarCEP(e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    className="ml-2 btn-secondary"
                    onClick={() => buscarCEP(formik.values.cep)}
                    disabled={formik.values.buscandoCEP || !formik.values.cep}
                  >
                    {formik.values.buscandoCEP ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
                <ErrorMessage
                  name="cep"
                  component="div"
                  className="form-error"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-2">
                <FormField 
                  label="Endereço" 
                  name="endereco" 
                  placeholder="Ex: Rua das Flores"
                />
              </div>
              <div>
                <FormField 
                  label="Número" 
                  name="numero" 
                  placeholder="Ex: 123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <FormField 
                  label="Complemento" 
                  name="complemento" 
                  placeholder="Ex: Bloco A"
                />
              </div>
              <div>
                <FormField 
                  label="Bairro" 
                  name="bairro" 
                  placeholder="Ex: Centro"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <FormField 
                  label="Cidade" 
                  name="cidade" 
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div>
                <label htmlFor="estado" className="form-label">
                  Estado
                </label>
                <Field
                  as="select"
                  id="estado"
                  name="estado"
                  className={`form-input ${
                    formik.errors.estado && formik.touched.estado ? 'border-danger-500' : ''
                  }`}
                >
                  <option value="">Selecione um estado...</option>
                  {estados.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="estado"
                  component="div"
                  className="form-error"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contato */}
        {activeTab === 'contato' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="telefone" className="form-label">
                  Telefone
                </label>
                <Field
                  id="telefone"
                  name="telefone"
                  className={`form-input ${
                    formik.errors.telefone && formik.touched.telefone ? 'border-danger-500' : ''
                  }`}
                  placeholder="(XX) XXXXX-XXXX"
                  onChange={(e) => {
                    const formatted = formatTelefone(e.target.value);
                    formik.setFieldValue('telefone', formatted);
                  }}
                />
                <ErrorMessage
                  name="telefone"
                  component="div"
                  className="form-error"
                />
              </div>
              <div>
                <FormField 
                  label="Email" 
                  name="email" 
                  type="email"
                  placeholder="Ex: contato@condominio.com.br"
                />
              </div>
            </div>
          </div>
        )}

        {/* Unidades Iniciais */}
        {activeTab === 'unidades' && !isEditing && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Unidades Iniciais</h3>
              <p className="text-sm text-gray-500">
                Adicione as unidades iniciais do condomínio (opcional)
              </p>
            </div>

            <FieldArray name="unidades">
              {({ push, remove, form }) => (
                <div>
                  <div className="mb-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => push({
                        bloco: '',
                        numero: '',
                        tipo: 'apartamento',
                        area: '',
                        quartos: '',
                        banheiros: '',
                        vagas_garagem: '',
                        status: 'vago'
                      })}
                    >
                      Adicionar Unidade
                    </button>
                  </div>

                  {formik.values.unidades.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bloco
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Número
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Área
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {formik.values.unidades.map((_, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2">
                                  <Field
                                    name={`unidades.${index}.bloco`}
                                    className="form-input py-1 px-2 text-sm"
                                    placeholder="Bloco"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Field
                                    name={`unidades.${index}.numero`}
                                    className="form-input py-1 px-2 text-sm"
                                    placeholder="Número"
                                  />
                                  <ErrorMessage
                                    name={`unidades.${index}.numero`}
                                    component="div"
                                    className="text-xs text-danger-500"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Field
                                    as="select"
                                    name={`unidades.${index}.tipo`}
                                    className="form-input py-1 px-2 text-sm"
                                  >
                                    <option value="apartamento">Apartamento</option>
                                    <option value="casa">Casa</option>
                                    <option value="sala">Sala</option>
                                    <option value="loja">Loja</option>
                                    <option value="outro">Outro</option>
                                  </Field>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center">
                                    <Field
                                      name={`unidades.${index}.area`}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="form-input py-1 px-2 text-sm w-16"
                                      placeholder="0"
                                    />
                                    <span className="ml-1 text-xs text-gray-500">m²</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  <Field
                                    as="select"
                                    name={`unidades.${index}.status`}
                                    className="form-input py-1 px-2 text-sm"
                                  >
                                    <option value="vago">Vago</option>
                                    <option value="ocupado">Ocupado</option>
                                    <option value="em_reforma">Em Reforma</option>
                                    <option value="indisponivel">Indisponível</option>
                                  </Field>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    type="button"
                                    className="text-danger-600 hover:text-danger-900"
                                    onClick={() => remove(index)}
                                  >
                                    Remover
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Você poderá adicionar mais unidades após criar o condomínio.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </FieldArray>
          </div>
        )}

        {/* Botões */}
        <div className="mt-6 flex justify-end space-x-2 border-t border-gray-200 pt-6">
          <Link
            to="/app/condominios"
            className="btn-secondary"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !formik.isValid || formik.isSubmitting}
          >
            {loading ? (
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
                {isEditing ? 'Atualizando...' : 'Salvando...'}
              </span>
            ) : (
              isEditing ? 'Atualizar Condomínio' : 'Salvar Condomínio'
            )}
          </button>
        </div>
      </div>
    </Form>
  );
};

export default FormCondominio;