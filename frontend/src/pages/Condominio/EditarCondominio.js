import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
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

const EditarCondominio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [condominio, setCondominio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Buscar dados do condomínio
  useEffect(() => {
    const fetchCondominio = async () => {
      try {
        const result = await condominioService.obterCondominio(id);
        
        if (result.success) {
          // Verificar permissão (admin ou síndico do condomínio)
          const condominioData = result.data.data;
          if (user.perfil !== 'admin' && condominioData.sindico_id !== user.id) {
            toast.error('Você não tem permissão para editar este condomínio');
            navigate(`/app/condominios/${id}`);
            return;
          }
          
          setCondominio(condominioData);
        } else {
          toast.error(result.message || 'Falha ao carregar dados do condomínio');
          navigate('/app/condominios');
        }
      } catch (error) {
        console.error('Erro ao carregar condomínio:', error);
        toast.error('Erro ao carregar dados do condomínio. Tente novamente mais tarde.');
        navigate('/app/condominios');
      } finally {
        setLoading(false);
      }
    };

    fetchCondominio();
  }, [id, navigate, user]);

  // Formatar dados para o formulário
  const getInitialValues = () => {
    return {
      nome: condominio.nome || '',
      cnpj: condominio.cnpj || '',
      endereco: condominio.endereco || '',
      numero: condominio.numero || '',
      complemento: condominio.complemento || '',
      bairro: condominio.bairro || '',
      cidade: condominio.cidade || '',
      estado: condominio.estado || '',
      cep: condominio.cep || '',
      telefone: condominio.telefone || '',
      email: condominio.email || '',
      data_fundacao: condominio.data_fundacao ? new Date(condominio.data_fundacao).toISOString().split('T')[0] : '',
      area_total: condominio.area_total || '',
      sindico_id: condominio.sindico_id || '',
      unidades: condominio.unidades || []
    };
  };

  // Enviar o formulário
  const handleSubmit = async (values) => {
    setSubmitting(true);
    
    try {
      // Converter valores numéricos
      const formattedValues = {
        ...values,
        area_total: values.area_total ? parseFloat(values.area_total) : null,
        sindico_id: values.sindico_id ? parseInt(values.sindico_id, 10) : null
      };

      // Remover o CNPJ para não tentar atualizá-lo
      delete formattedValues.cnpj;
      
      // Remover unidades para não atualizá-las aqui
      delete formattedValues.unidades;

      const result = await condominioService.atualizarCondominio(id, formattedValues);
      
      if (result.success) {
        toast.success('Condomínio atualizado com sucesso!');
        navigate(`/app/condominios/${id}`);
      } else {
        toast.error(result.message || 'Falha ao atualizar condomínio');
      }
    } catch (error) {
      console.error('Erro ao atualizar condomínio:', error);
      toast.error('Erro ao atualizar condomínio. Tente novamente mais tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title mb-6">Editar Condomínio</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Formik
          initialValues={getInitialValues()}
          validationSchema={CondominioSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps) => (
            <FormCondominio 
              formik={formikProps} 
              loading={submitting}
              isEditing={true}
            />
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditarCondominio;