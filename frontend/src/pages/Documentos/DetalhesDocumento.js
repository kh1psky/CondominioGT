import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const DetalhesDocumento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do documento
  useEffect(() => {
    const fetchDocumento = async () => {
      try {
        const response = await api.get(`/documentos/${id}`);
        
        if (response.data.success) {
          setDocumento(response.data.data);
        } else {
          toast.error(response.data.message || 'Falha ao carregar documento');
          navigate('/app/documentos');
        }
      } catch (error) {
        console.error('Erro ao carregar documento:', error);
        toast.error('Erro ao carregar documento. Tente novamente mais tarde.');
        navigate('/app/documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumento();
  }, [id, navigate]);

  // Função para excluir o documento
  const handleExcluirDocumento = async () => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        const response = await api.delete(`/documentos/${id}`);
        
        if (response.data.success) {
          toast.success('Documento excluído com sucesso');
          navigate('/app/documentos');
        } else {
          toast.error(response.data.message || 'Falha ao excluir documento');
        }
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        toast.error('Erro ao excluir documento. Tente novamente mais tarde.');
      }
    }
  };

  // Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Função para formatar tamanho do arquivo
  const formatarTamanho = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para obter ícone baseado no tipo de documento
  const getDocumentIcon = (tipo) => {
    if (!tipo) return null;
    
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'xls':
      case 'xlsx':
        return (
          <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <svg className="w-12 h-12 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Documento não encontrado.</p>
          <Link 
            to="/app/documentos" 
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
          >
            Voltar para lista de documentos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Detalhes do Documento</h1>
        <div className="flex space-x-2">
          <Link to="/app/documentos" className="btn-secondary">
            Voltar
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="flex justify-center items-center p-6 bg-gray-50 rounded-lg mb-4 md:mb-0 md:mr-6 md:w-1/4">
              {getDocumentIcon(documento.tipo)}
              <div className="ml-4">
                <p className="text-lg font-semibold text-gray-900">{documento.tipo?.toUpperCase() || 'Desconhecido'}</p>
                <p className="text-sm text-gray-500">{formatarTamanho(documento.tamanho)}</p>
              </div>
            </div>
            
            <div className="md:w-3/4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{documento.nome}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Upload</p>
                  <p className="text-base text-gray-900">{formatarData(documento.data_upload)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Enviado por</p>
                  <p className="text-base text-gray-900">{documento.usuario?.nome || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Condomínio</p>
                  <p className="text-base text-gray-900">{documento.condominio?.nome || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Arquivo</p>
                  <p className="text-base text-gray-900">{documento.tipo?.toUpperCase() || 'Desconhecido'}</p>
                </div>
              </div>
              
              {documento.descricao && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-500 mb-1">Descrição</p>
                  <p className="text-base text-gray-900">{documento.descricao}</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <a 
                  href={documento.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Visualizar / Download
                </a>
                <button
                  onClick={handleExcluirDocumento}
                  className="btn-danger"
                >
                  Excluir Documento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesDocumento;