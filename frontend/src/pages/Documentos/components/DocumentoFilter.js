import React, { useState } from 'react';

const DocumentoFilter = ({ filtros, onChange, condominios }) => {
  const [localFiltros, setLocalFiltros] = useState(filtros);
  const tiposDocumento = [
    'PDF',
    'DOC',
    'DOCX',
    'XLS',
    'XLSX',
    'JPG',
    'JPEG',
    'PNG',
    'TXT'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onChange(localFiltros);
  };

  const handleReset = () => {
    const resetFiltros = {
      search: '',
      tipo: '',
      condominio: '',
      dataInicio: '',
      dataFim: ''
    };
    setLocalFiltros(resetFiltros);
    onChange(resetFiltros);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            type="text"
            id="search"
            name="search"
            className="form-input w-full"
            placeholder="Nome, descrição..."
            value={localFiltros.search}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            className="form-input w-full"
            value={localFiltros.tipo}
            onChange={handleChange}
          >
            <option value="">Todos os tipos</option>
            {tiposDocumento.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
          <input
            type="date"
            id="dataInicio"
            name="dataInicio"
            className="form-input w-full"
            value={localFiltros.dataInicio}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
          <input
            type="date"
            id="dataFim"
            name="dataFim"
            className="form-input w-full"
            value={localFiltros.dataFim}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label htmlFor="condominio" className="block text-sm font-medium text-gray-700 mb-1">Condomínio</label>
          <select
            id="condominio"
            name="condominio"
            className="form-input w-full"
            value={localFiltros.condominio}
            onChange={handleChange}
          >
            <option value="">Todos os condomínios</option>
            {condominios.map(cond => (
              <option key={cond.id} value={cond.id}>{cond.nome}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <button
          type="button"
          onClick={handleReset}
          className="btn-secondary"
        >
          Limpar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
};

export default DocumentoFilter;