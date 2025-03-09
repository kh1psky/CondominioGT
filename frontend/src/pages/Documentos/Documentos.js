import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

// Componentes
import DocumentoFilter from './components/DocumentoFilter';

const Documentos = () => {
  const { user } = useAuth();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    tipo: '',
    condominio: '',
    dataInicio: '',
    dataFim: ''
  });
  const [condominios, setCondominios] = useState([]);
  const [paginacao, setPaginacao] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Buscar condominios para o filtro
  useEffect(() => {
    const fetchCondominios = async () => {
      try {
        const response = await api.get('/condominios', {
          params: { limit: 100 } // Buscar todos para o filtro
        });
        
        if (response.data.success) {
          setCondominios(response.data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar condominios:', error);
      }
    };

    fetchCondominios();
  }, []);

  // Buscar documentos quando os filtros ou página mudarem
  useEffect(() => {
    const fetchDocumentos = async () => {
      setLoading(true);
      try {
        const params = {
          page: paginacao.page,
          limit: paginacao.limit,
          search: filtros.search,
          tipo: filtros.tipo || undefined,
          condominio_id: filtros.condominio || undefined,
          data_inicio: filtros.dataInicio || undefined,
          data_fim: filtros.dataFim || undefined
        };

        const response = await api.get('/documentos', { params });
        
        if (response.data.success) {
          setDocumentos(response.data.data);
          setPaginacao(prev => ({
            ...prev,
            total: response.data.meta.total,
            totalPages: response.data.meta.pages
          }));
        } else {
          toast.error(response.data.message || 'Falha ao carregar documentos');
        }
      } catch (error) {
        console.error('Erro ao carregar documentos:', error);
        toast.error('Erro ao carregar documentos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, [filtros, paginacao.page, paginacao.limit]);

  // Função para mudar a página
  const handlePageChange = (newPage) => {
    setPaginacao(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Função para mudar os filtros
  const handleFilterChange = (novosFiltros) => {
    setFiltros(novosFiltros);
    setPaginacao(prev => ({
      ...prev,
      page: 1 // Voltar para primeira página quando mudar filtros
    }));
  };

  // Função para excluir um documento
  const handleExcluirDocumento = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        const response = await api.delete(`/documentos/${id}`);
        
        if (response.data.success) {
          toast.success('Documento excluído com sucesso');
          // Atualizar lista
          setDocumentos(documentos.filter(doc => doc.id !== id));
          setPaginacao(prev => ({
            ...prev,
            total: prev.total - 1
          }));
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
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'xls':
      case 'xlsx':
        return (
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Documentos</h1>
        <Link to="/app/documentos/novo" className="btn-primary">
          Novo Documento
        </Link>
      </div>

      {/* Filtros */}
      <DocumentoFilter 
        filtros={filtros} 
        onChange={handleFilterChange} 
        condominios={condominios} 
      />

      {/* Lista de documentos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : documentos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Nenhum documento encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condomínio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Upload
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentos.map(documento => (
                  <tr key={documento.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getDocumentIcon(documento.tipo)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{documento.nome}</div>
                          <div className="text-sm text-gray-500">{documento.descricao}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {documento.tipo.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {documento.condominio?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(documento.data_upload)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarTamanho(documento.tamanho)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a 
                          href={documento.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Visualizar
                        </a>
                        <button
                          onClick={() => handleExcluirDocumento(documento.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginação */}
      {!loading && documentos.length > 0 && paginacao.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(paginacao.page - 1)}
              disabled={paginacao.page === 1}
              className={`px-3 py-1 rounded ${paginacao.page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Anterior
            </button>
            
            {[...Array(paginacao.totalPages).keys()].map(num => (
              <button
                key={num + 1}
                onClick={() => handlePageChange(num + 1)}
                className={`px-3 py-1 rounded ${paginacao.page === num + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {num + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(paginacao.page + 1)}
              disabled={paginacao.page === paginacao.totalPages}
              className={`px-3 py-1 rounded ${paginacao.page === paginacao.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Próximo
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Documentos;