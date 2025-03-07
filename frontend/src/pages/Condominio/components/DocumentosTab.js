import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Simulação de documentos
const documentosMock = [
  {
    id: 1,
    titulo: 'Ata de Assembleia Ordinária',
    descricao: 'Ata da assembleia ordinária realizada em 15/03/2023',
    tipo: 'ata',
    data_upload: new Date(2023, 2, 15),
    autor: 'João Silva',
    arquivo: 'ata_assembleia_ordinaria_15032023.pdf',
    tamanho: 1.4, // MB
    categoria: 'Assembleias'
  },
  {
    id: 2,
    titulo: 'Relatório Financeiro de Abril',
    descricao: 'Relatório detalhado das finanças do condomínio para o mês de abril',
    tipo: 'financeiro',
    data_upload: new Date(2023, 4, 5),
    autor: 'Maria Oliveira',
    arquivo: 'relatorio_financeiro_abril_2023.pdf',
    tamanho: 2.1, // MB
    categoria: 'Financeiro'
  },
  {
    id: 3,
    titulo: 'Regulamento Interno',
    descricao: 'Regulamento interno do condomínio atualizado em 2023',
    tipo: 'regulamento',
    data_upload: new Date(2023, 1, 10),
    autor: 'Conselho Administrativo',
    arquivo: 'regulamento_interno_2023.pdf',
    tamanho: 0.8, // MB
    categoria: 'Regulamentos'
  },
  {
    id: 4,
    titulo: 'Contrato de Manutenção do Elevador',
    descricao: 'Contrato firmado com a empresa XYZ para manutenção dos elevadores',
    tipo: 'contrato',
    data_upload: new Date(2023, 0, 20),
    autor: 'Carlos Santos',
    arquivo: 'contrato_manutencao_elevador_2023.pdf',
    tamanho: 3.2, // MB
    categoria: 'Contratos'
  },
  {
    id: 5,
    titulo: 'Orçamento para Reforma da Piscina',
    descricao: 'Orçamento aprovado para reforma da área da piscina',
    tipo: 'orcamento',
    data_upload: new Date(2023, 3, 18),
    autor: 'Pedro Almeida',
    arquivo: 'orcamento_reforma_piscina.pdf',
    tamanho: 1.7, // MB
    categoria: 'Obras'
  }
];

const DocumentosTab = ({ condominioId }) => {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  
  // Carregar documentos
  useEffect(() => {
    const fetchDocumentos = async () => {
      // Simulação de chamada à API
      // Em uma implementação real, você faria:
      // const response = await api.get(`/condominios/${condominioId}/documentos`);
      
      setTimeout(() => {
        setDocumentos(documentosMock);
        
        // Extrair categorias únicas
        const categoriasUnicas = [...new Set(documentosMock.map(doc => doc.categoria))];
        setCategorias(categoriasUnicas);
        
        setLoading(false);
      }, 800);
    };
    
    fetchDocumentos();
  }, [condominioId]);
  
  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    const matchTexto = doc.titulo.toLowerCase().includes(filtro.toLowerCase()) || 
                      doc.descricao.toLowerCase().includes(filtro.toLowerCase());
    const matchCategoria = categoriaFiltro === '' || doc.categoria === categoriaFiltro;
    
    return matchTexto && matchCategoria;
  });
  
  // Formatar data
  const formatarData = (data) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(data);
  };
  
  // Obter ícone com base no tipo de documento
  const getIconeDocumento = (tipo) => {
    switch (tipo) {
      case 'ata':
        return (
          <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'financeiro':
        return (
          <svg className="h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'regulamento':
        return (
          <svg className="h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'contrato':
        return (
          <svg className="h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'orcamento':
        return (
          <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="section-title mb-4 md:mb-0">Documentos</h2>
        <Link 
          to={`/app/documentos/novo?condominio=${condominioId}`}
          className="btn-primary"
        >
          Adicionar Documento
        </Link>
      </div>
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="search" className="sr-only">
                Buscar documento
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="form-input pl-10"
                  placeholder="Buscar por título ou descrição..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                id="categoria"
                className="form-input"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categorias.map((categoria, index) => (
                  <option key={index} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de Documentos */}
      {documentosFiltrados.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum documento encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filtro || categoriaFiltro 
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : 'Comece adicionando um novo documento.'}
          </p>
          {!filtro && !categoriaFiltro && (
            <div className="mt-6">
              <Link 
                to={`/app/documentos/novo?condominio=${condominioId}`}
                className="btn-primary"
              >
                Adicionar Documento
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentosFiltrados.map((documento) => (
            <div key={documento.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getIconeDocumento(documento.tipo)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{documento.titulo}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                          {documento.categoria}
                        </span>
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                          onClick={() => {
                            toast.info(`Download simulado: ${documento.arquivo}`);
                          }}
                        >
                          Baixar
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {documento.descricao}
                    </p>
                    <div className="mt-3 flex justify-between text-xs text-gray-500">
                      <span>Enviado por {documento.autor}</span>
                      <span>{formatarData(documento.data_upload)}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Tamanho: {documento.tamanho} MB
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    toast.info(`Visualizar documento: ${documento.arquivo}`);
                  }}
                >
                  Visualizar
                </button>
                <Link
                  to={`/app/documentos/${documento.id}/editar`}
                  className="text-sm text-primary-600 hover:text-primary-900"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  className="text-sm text-danger-600 hover:text-danger-900"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
                      toast.success('Documento excluído com sucesso!');
                      setDocumentos(documentos.filter(doc => doc.id !== documento.id));
                    }
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentosTab;