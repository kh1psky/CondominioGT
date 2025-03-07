import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import condominioService from '../../services/condominioService';
import { useAuth } from '../../hooks/useAuth';

// Componentes
import FormCondominio from './components/FormCondominio';

// Esquema de validação
const CondominioSchema = Yup.object().shape({
  nome: Yup.string()
    .min(3, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .required('O nome do condomínio é obrigatório'),
  cnpj: Yup.string()
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/, 'Formato de CNPJ inválido (XX.XXX.XXX/XXXX-XX)')
    .required('O CNPJ é obrigatório'),
  endereco: Yup.string()
    .required('O endereço é obrigatório'),
  numero: Yup.string()
    .required('O número é obrigatório'),
  bairro: Yup.string()
    .required('O bairro é obrigatório'),
  cidade: Yup.string()
    .required('A cidade é obrigatória'),
  estado: Yup.string()
    .required('O estado é obrigatório'),
  cep: Yup.string()
    .matches(/^\d{5}\-\d{3}$/, 'Formato de CEP inválido (XXXXX-XXX)')
    .required('O CEP é obrigatório'),
  telefone: Yup.string()
    .nullable(),
  email: Yup.string()
    .email('Email inválido')
    .nullable(),
  data_fundacao: Yup.date()
    .nullable(),
  area_total: Yup.number()
    .positive('A área deve ser positiva')
    .nullable(),
  sindico_id: Yup.number()
    .nullable()
});

const NovoCondominio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Valores iniciais
  const initialValues = {
    nome: '',
    cnpj: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    data_fundacao: '',
    area_total: '',
    sindico_id: user?.perfil === 'sindico' ? user.id : '',
    unidades: []
  };

  // Enviar o formulário
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // Converter valores numéricos
      const formattedValues = {
        ...values,
        area_total: values.area_total ? parseFloat(values.area_total) : null,
        sindico_id: values.sindico_id ? parseInt(values.sindico_id, 10) : null,
        unidades: values.unidades.map(unidade => ({
          ...unidade,
          area: unidade.area ? parseFloat(unidade.area) : null,
          quartos: unidade.quartos ? parseInt(unidade.quartos, 10) : null,
          banheiros: unidade.banheiros ? parseInt(unidade.banheiros, 10) : null,
          vagas_garagem: unidade.vagas_garagem ? parseInt(unidade.vagas_garagem, 10) : null
        }))
      };

      const result = await condominioService.criarCondominio(formattedValues);
      
      if (result.success) {
        toast.success('Condomínio criado com sucesso!');
        navigate(`/app/condominios/${result.data.data.id}`);
      } else {
        toast.error(result.message || 'Falha ao criar condomínio');
      }
    } catch (error) {
      console.error('Erro ao criar condomínio:', error);
      toast.error('Erro ao criar condomínio. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title mb-6">Novo Condomínio</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Formik
          initialValues={initialValues}
          validationSchema={CondominioSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps) => (
            <FormCondominio formik={formikProps} loading={loading} />
          )}
        </Formik>
      </div>
    </div>
  );
};

export default NovoCondominio;