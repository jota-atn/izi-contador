export interface ThemeColors {
  bg: string; // fundo raiz
  bgElevated: string; // cards, inputs
  bgElevated2: string; // chips, superfícies secundárias
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  placeholder: string; // placeholder de input, ícones bem apagados — mais fraco que textFaint
  textValue: string; // valor digitado/exibido em inputs e linhas de detalhe
  accent: string;
  accentLight: string;
  accentSurface: string;
  accentSurfaceBorder: string;
  accentTextOn: string; // texto sobre accentSurface
  success: string;
  successSurface: string;
  successBorder: string;
  danger: string;
  dangerSurface: string;
  dangerBorder: string;
  warning: string;
  warningSurface: string;
  warningBorder: string;
  warningTextOn: string; // texto sobre warningSurface
  pending: string; // âmbar de "pendente" (fatura/pagamento) — distinto do warning de avisos
}

// valores atuais do app, só reorganizados em nomes semânticos — nada muda
// visualmente no modo escuro
export const darkTheme: ThemeColors = {
  bg: '#020617',
  bgElevated: '#0f172a',
  bgElevated2: '#1e293b',
  border: '#1e293b',
  borderStrong: '#334155',
  textPrimary: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textFaint: '#64748b',
  placeholder: '#475569',
  textValue: '#e2e8f0',
  accent: '#7c3aed',
  accentLight: '#a78bfa',
  accentSurface: '#1e1040',
  accentSurfaceBorder: '#4c1d95',
  accentTextOn: '#e9d5ff',
  success: '#4ade80',
  successSurface: '#052e16',
  successBorder: '#14532d',
  danger: '#f87171',
  dangerSurface: '#1c0707',
  dangerBorder: '#7f1d1d',
  warning: '#fb923c',
  warningSurface: '#1c0a00',
  warningBorder: '#7c2d12',
  warningTextOn: '#fdba74',
  pending: '#f59e0b',
};

// clara, mas suave de propósito — fundo cinza-azulado em vez de branco puro,
// texto grafite em vez de preto, marca roxa mantida entre os dois temas; cores
// de status escurecidas pra manter contraste legível sobre fundo claro
export const lightTheme: ThemeColors = {
  bg: '#e7ebf1',
  bgElevated: '#f7f9fb',
  bgElevated2: '#e9edf3',
  border: '#d7dce4',
  borderStrong: '#c3cad6',
  textPrimary: '#1e293b',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  placeholder: '#94a3b8',
  textValue: '#334155',
  accent: '#7c3aed',
  accentLight: '#8b5cf6',
  accentSurface: '#ede9fe',
  accentSurfaceBorder: '#c4b5fd',
  accentTextOn: '#5b21b6',
  success: '#16a34a',
  successSurface: '#dcfce7',
  successBorder: '#86efac',
  danger: '#dc2626',
  dangerSurface: '#fee2e2',
  dangerBorder: '#fca5a5',
  warning: '#d97706',
  warningSurface: '#fef3c7',
  warningBorder: '#fcd34d',
  warningTextOn: '#92400e',
  pending: '#b45309',
};
