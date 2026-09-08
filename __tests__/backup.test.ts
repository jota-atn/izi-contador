import { validarBackup, BACKUP_VERSION } from '../src/storage/backup';

function backupValido() {
  return {
    version: BACKUP_VERSION,
    exportadoEm: '2026-01-01T00:00:00.000Z',
    faturas: [],
    estado: [],
    edicoes: [],
    chat: [],
    avisosDispensados: [],
    config: { categorias: {}, regras: {}, assinaturas: [], pixKey: '' },
  };
}

describe('validarBackup', () => {
  it('aceita um backup bem formado', () => {
    expect(() => validarBackup(backupValido())).not.toThrow();
  });

  it('rejeita versão incompatível', () => {
    expect(() => validarBackup({ ...backupValido(), version: 999 })).toThrow();
  });

  it('rejeita quando faltam campos obrigatórios', () => {
    const { faturas: _faturas, ...semFaturas } = backupValido();
    expect(() => validarBackup(semFaturas)).toThrow();
  });

  it('rejeita null/undefined/tipos primitivos', () => {
    expect(() => validarBackup(null)).toThrow();
    expect(() => validarBackup(undefined)).toThrow();
    expect(() => validarBackup('texto qualquer')).toThrow();
    expect(() => validarBackup(42)).toThrow();
  });

  it('aceita backup antigo sem edicoesOrfas/divisoes/divisoesOrfas (compatibilidade)', () => {
    const antigo = backupValido();
    expect('edicoesOrfas' in antigo).toBe(false);
    expect('divisoes' in antigo).toBe(false);
    expect(() => validarBackup(antigo)).not.toThrow();
  });
});
