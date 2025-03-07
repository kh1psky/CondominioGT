import React from 'react';
import { Link } from 'react-router-dom';

const DetalhesBasicos = ({ condominio }) => {
  // Formatar data
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(data);
  };

  // Formatar moeda
  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="p-6">
      <h2 className="section-title">Informações Detalhadas</h2>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Coluna da Esquerda */}
        <div>
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-base font-semibold mb-4">Dados Gerais</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome do Condomínio</p>
                <p className="font-medium">{condominio.nome}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">CNPJ</p>
                <p className="font-medium">{condominio.cnpj}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Data de Fundação</p>
                <p className="font-medium">
                  {formatarData(condominio.data_fundacao)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Área Total</p>
                <p className="font-medium">
                  {condominio.area_total ? `${condominio.area_total} m²` : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Total de Unidades</p>
                <p className="font-medium">{condominio.total_unidades || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 mt-6">
            <h3 className="text-base font-semibold mb-4">Informações de Contato</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{condominio.telefone || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{condominio.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna da Direita */}
        <div>
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-base font-semibold mb-4">Endereço</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">Logradouro</p>
                <p className="font-medium">
                  {condominio.endereco}, {condominio.numero}
                  {condominio.complemento && ` - ${condominio.complemento}`}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Bairro</p>
                <p className="font-medium">{condominio.bairro}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Cidade/Estado</p>
                <p className="font-medium">
                  {condominio.cidade}/{condominio.estado}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">CEP</p>
                <p className="font-medium">{condominio.cep}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 mt-6">
            <h3 className="text-base font-semibold mb-4">Síndico</h3>
            
            {condominio.sindico ? (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold uppercase">
                    {condominio.sindico.nome.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{condominio.sindico.nome}</p>
                  <p className="text-sm text-gray-500">{condominio.sindico.email}</p>
                  <p className="text-sm text-gray-500">{condominio.sindico.telefone || 'Telefone não cadastrado'}</p>
                </div>
              </div>
            ) : (
              <div className="text-yellow-600 flex items-center">
                <svg
                  className="mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Síndico não definido</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold mb-2">Informações Administrativas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${condominio.ativo ? 'text-success-600' : 'text-yellow-600'}`}>
              {condominio.ativo ? 'Ativo' : 'Inativo'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Data de Cadastro</p>
            <p className="font-medium">{formatarData(condominio.createdAt)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Última Atualização</p>
            <p className="font-medium">{formatarData(condominio.updatedAt)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">ID no Sistema</p>
            <p className="font-medium">{condominio.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesBasicos;