import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const NovoDocumento = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [condominios, setCondominios] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    condominio_id: '',
    arquivo: null
  });

  // Buscar condominios para o select
  useEffect(() => {
    const fetchCondominios = async () => {
      try {
        const response = await api.get('/condominios', {
          params: { limit: 100 }
        });
        
        if (response.data.success) {
          setCondominios(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar condominios:', error);
        toast.error('Erro ao carregar lista de condomínios');
      }
    };

    fetchCondominios();
  }, []);

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para lidar com a seleção de arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        arquivo: file
      }));
    }
  };

  // Função para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.arquivo) {
      toast.error('Por favor, selecione um arquivo para upload');
      return;
    }

    if (!formData.nome) {
      toast.error('Por favor, informe um nome para o documento');
      return;
    }

    setLoading(true);

    try {
      // Criar FormData para envio do arquivo
      const data = new FormData();
      data.append('nome', formData.nome);
      data.append('descricao', formData.descricao);
      data.append('condominio_id', formData.condominio_id);
      data.append('arquivo', formData.arquivo);

      const response = await api.post('/documentos', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Documento enviado com sucesso!');
        navigate('/app/documentos');
      } else {
        toast.error(response.data.message || 'Falha ao enviar documento');
      }
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      toast.error('Erro ao enviar documento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o tipo do arquivo a partir da extensão
  const getFileType = (fileName) => {
    if (!fileName) return '';
    const extension = fileName.split('.').pop().toLowerCase();
    return extension;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Novo Documento</h1>
        <p className="text-gray-600 mt-1">Faça upload de um novo documento</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome do documento */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Documento *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="form-input w-full"
                required
              />
            </div>

            {/* Condomínio */}
            <div>
              <label htmlFor="condominio_id" className="block text-sm font-medium text-gray-700 mb-1">
                Condomínio
              </label>
              <select
                id="condominio_id"
                name="condominio_id"
                value={formData.condominio_id}
                onChange={handleChange}
                className="form-input w-full"
              >
                <option value="">Selecione um condomínio (opcional)</option>
                {condominios.map(cond => (
                  <option key={cond.id} value={cond.id}>{cond.nome}</option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows="3"
                className="form-input w-full"
              ></textarea>
            </div>

            {/* Upload de arquivo */}
            <div className="md:col-span-2">
              <label htmlFor="arquivo" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="arquivo"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Selecione um arquivo</span>
                      <input
                        id="arquivo"
                        name="arquivo"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, XLS, JPG, PNG até 10MB
                  </p>
                  {formData.arquivo && (
                    <p className="text-sm text-green-600">
                      Arquivo selecionado: {formData.arquivo.name} ({(formData.arquivo.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={() => navigate('/app/documentos')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : 'Enviar Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoDocumento;