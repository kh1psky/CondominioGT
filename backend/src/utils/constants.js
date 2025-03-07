/**
 * Constantes utilizadas no sistema
 */

/**
 * Perfis de usuário
 */
const PERFIS = {
    ADMIN: 'admin',
    SINDICO: 'sindico',
    FUNCIONARIO: 'funcionario',
    MORADOR: 'morador'
  };
  
  /**
   * Status da unidade
   */
  const STATUS_UNIDADE = {
    OCUPADO: 'ocupado',
    VAGO: 'vago',
    EM_REFORMA: 'em_reforma',
    INDISPONIVEL: 'indisponivel'
  };
  
  /**
   * Tipos de unidade
   */
  const TIPOS_UNIDADE = {
    APARTAMENTO: 'apartamento',
    CASA: 'casa',
    SALA: 'sala',
    LOJA: 'loja',
    OUTRO: 'outro'
  };
  
  /**
   * Estados brasileiros
   */
  const ESTADOS_BRASILEIROS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  /**
   * Tipos de pagamento
   */
  const TIPOS_PAGAMENTO = {
    CAIXA: 'caixa',
    PIX: 'pix',
    BOLETO: 'boleto',
    DEPOSITO: 'deposito',
    CARTAO: 'cartao',
    TRANSFERENCIA: 'transferencia',
    CHEQUE: 'cheque',
    OUTROS: 'outros'
  };
  
  /**
   * Status do pagamento
   */
  const STATUS_PAGAMENTO = {
    PENDENTE: 'pendente',
    PAGO: 'pago',
    ATRASADO: 'atrasado',
    CANCELADO: 'cancelado',
    ESTORNADO: 'estornado'
  };
  
  /**
   * Categorias de documento
   */
  const CATEGORIAS_DOCUMENTO = {
    ATAS: 'Atas',
    REGULAMENTOS: 'Regulamentos',
    FINANCEIRO: 'Financeiro',
    CONTRATOS: 'Contratos',
    COMUNICADOS: 'Comunicados',
    OBRAS: 'Obras',
    OUTROS: 'Outros'
  };
  
  /**
   * Tipos de documento
   */
  const TIPOS_DOCUMENTO = {
    ATA: 'ata',
    FINANCEIRO: 'financeiro',
    REGULAMENTO: 'regulamento',
    CONTRATO: 'contrato',
    ORCAMENTO: 'orcamento',
    COMUNICADO: 'comunicado',
    OUTRO: 'outro'
  };
  
  /**
   * Status da manutenção
   */
  const STATUS_MANUTENCAO = {
    SOLICITADA: 'solicitada',
    AGENDADA: 'agendada',
    EM_ANDAMENTO: 'em_andamento',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada'
  };
  
  /**
   * Prioridades de manutenção
   */
  const PRIORIDADES_MANUTENCAO = {
    BAIXA: 'baixa',
    MEDIA: 'media',
    ALTA: 'alta',
    CRITICA: 'critica'
  };
  
  /**
   * Limites
   */
  const LIMITES = {
    UPLOAD_TAMANHO_MAX: 5 * 1024 * 1024, // 5MB
    SENHA_TAMANHO_MIN: 6,
    PAGINACAO_PADRAO: 10,
    PAGINACAO_MAX: 100
  };
  
  /**
   * Exportar constantes
   */
  module.exports = {
    PERFIS,
    STATUS_UNIDADE,
    TIPOS_UNIDADE,
    ESTADOS_BRASILEIROS,
    TIPOS_PAGAMENTO,
    STATUS_PAGAMENTO,
    CATEGORIAS_DOCUMENTO,
    TIPOS_DOCUMENTO,
    STATUS_MANUTENCAO,
    PRIORIDADES_MANUTENCAO,
    LIMITES
  };