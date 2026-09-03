import { SQLiteDatabase } from 'expo-sqlite';
import { RelatorioFatura } from '../types';
import { Categorias, loadCategorias, saveCategorias } from '../config/categorias';
import { RegrasAlocacao, loadRegras, saveRegras } from '../config/regrasAlocacao';
import { Assinatura, loadAssinaturas, saveAssinaturas } from '../config/assinaturas';
import { loadPixKey, savePixKey } from '../config/pixKey';
import { Orcamentos, loadOrcamentos, saveOrcamentos } from '../config/orcamentos';
import { OrcamentoAlertas, loadOrcamentoAlertas, saveOrcamentoAlertas } from './orcamentoAlertas';

export const BACKUP_VERSION = 1;

interface FaturaRow {
  mes: string;
  data: RelatorioFatura;
}

interface EstadoRow {
  mes: string;
  dono: string;
  oculto: boolean;
  pago: boolean;
}

interface EdicaoRow {
  mes: string;
  item_desc: string;
  item_data: string;
  item_valor: number;
  novo_dono: string | null;
  nova_desc: string | null;
  deletado: boolean;
}

interface ChatRow {
  mes: string;
  role: string;
  content: string;
  is_hidden: boolean;
}

interface AvisoDispensadoRow {
  mes: string;
  titulo: string;
  valor: number;
  soma: number;
}

interface EdicaoOrfaRow extends EdicaoRow {
  detectado_em: string;
}

interface DivisaoRow {
  mes: string;
  item_desc: string;
  item_data: string;
  item_valor: number;
  pessoa: string;
  valor: number;
}

interface DivisaoOrfaRow extends DivisaoRow {
  detectado_em: string;
}

export interface BackupData {
  version: number;
  exportadoEm: string;
  faturas: FaturaRow[];
  estado: EstadoRow[];
  edicoes: EdicaoRow[];
  chat: ChatRow[];
  avisosDispensados: AvisoDispensadoRow[];
  // opcionais: ausentes em backups exportados antes dessas tabelas existirem
  edicoesOrfas?: EdicaoOrfaRow[];
  divisoes?: DivisaoRow[];
  divisoesOrfas?: DivisaoOrfaRow[];
  config: {
    categorias: Categorias;
    regras: RegrasAlocacao;
    assinaturas: Assinatura[];
    pixKey: string;
    // opcionais: ausentes em backups exportados antes de existirem
    orcamentos?: Orcamentos;
    orcamentoAlertas?: OrcamentoAlertas;
  };
}

export async function gerarBackup(db: SQLiteDatabase, userEmail: string): Promise<BackupData> {
  const [
    faturasRaw,
    estadoRaw,
    edicoesRaw,
    chatRaw,
    avisosDispensados,
    edicoesOrfasRaw,
    divisoes,
    divisoesOrfas,
    categorias,
    regras,
    assinaturas,
    pixKey,
    orcamentos,
    orcamentoAlertas,
  ] = await Promise.all([
    db.getAllAsync<{ mes: string; data: string }>(
      'SELECT mes, data FROM faturas_v2 WHERE user_id = ?',
      userEmail,
    ),
    db.getAllAsync<{ mes: string; dono: string; oculto: number; pago: number }>(
      'SELECT mes, dono, oculto, pago FROM estado_v2 WHERE user_id = ?',
      userEmail,
    ),
    db.getAllAsync<{
      mes: string;
      item_desc: string;
      item_data: string;
      item_valor: number;
      novo_dono: string | null;
      nova_desc: string | null;
      deletado: number;
    }>(
      'SELECT mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado FROM edicoes_v1 WHERE user_id = ?',
      userEmail,
    ),
    db.getAllAsync<{ mes: string; role: string; content: string; is_hidden: number }>(
      'SELECT mes, role, content, is_hidden FROM chat_v1 WHERE user_id = ?',
      userEmail,
    ),
    db.getAllAsync<AvisoDispensadoRow>(
      'SELECT mes, titulo, valor, soma FROM avisos_dispensados_v1 WHERE user_id = ?',
      userEmail,
    ),
    db.getAllAsync<{
      mes: string;
      item_desc: string;
      item_data: string;
      item_valor: number;
      novo_dono: string | null;
      nova_desc: string | null;
      deletado: number;
      detectado_em: string;
    }>(
      'SELECT mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado, detectado_em FROM edicoes_orfas_v1 WHERE user_id = ?',
      userEmail,
    ),
    db.getAllAsync<DivisaoRow>(
      'SELECT mes, item_desc, item_data, item_valor, pessoa, valor FROM divisoes_v1 WHERE user_id = ?',
      userEmail,
    ),
    db.getAllAsync<DivisaoOrfaRow>(
      'SELECT mes, item_desc, item_data, item_valor, pessoa, valor, detectado_em FROM divisoes_orfas_v1 WHERE user_id = ?',
      userEmail,
    ),
    loadCategorias(userEmail),
    loadRegras(userEmail),
    loadAssinaturas(userEmail),
    loadPixKey(userEmail),
    loadOrcamentos(userEmail),
    loadOrcamentoAlertas(userEmail),
  ]);

  return {
    version: BACKUP_VERSION,
    exportadoEm: new Date().toISOString(),
    faturas: faturasRaw.map((r) => ({ mes: r.mes, data: JSON.parse(r.data) as RelatorioFatura })),
    estado: estadoRaw.map((r) => ({
      mes: r.mes,
      dono: r.dono,
      oculto: r.oculto === 1,
      pago: r.pago === 1,
    })),
    edicoes: edicoesRaw.map((r) => ({ ...r, deletado: r.deletado === 1 })),
    chat: chatRaw.map((r) => ({ ...r, is_hidden: r.is_hidden === 1 })),
    avisosDispensados,
    edicoesOrfas: edicoesOrfasRaw.map((r) => ({ ...r, deletado: r.deletado === 1 })),
    divisoes,
    divisoesOrfas,
    config: { categorias, regras, assinaturas, pixKey, orcamentos, orcamentoAlertas },
  };
}

export function validarBackup(raw: unknown): BackupData {
  if (
    !raw ||
    typeof raw !== 'object' ||
    (raw as BackupData).version !== BACKUP_VERSION ||
    !Array.isArray((raw as BackupData).faturas) ||
    !Array.isArray((raw as BackupData).estado) ||
    !Array.isArray((raw as BackupData).edicoes) ||
    !Array.isArray((raw as BackupData).chat) ||
    typeof (raw as BackupData).config !== 'object'
  ) {
    throw new Error('Arquivo de backup inválido ou de uma versão incompatível.');
  }
  return raw as BackupData;
}

// substitui por completo os dados do usuário — não faz merge com o que já existe
export async function restaurarBackup(
  db: SQLiteDatabase,
  userEmail: string,
  backup: BackupData,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM faturas_v2 WHERE user_id = ?', userEmail);
    await db.runAsync('DELETE FROM estado_v2 WHERE user_id = ?', userEmail);
    await db.runAsync('DELETE FROM edicoes_v1 WHERE user_id = ?', userEmail);
    await db.runAsync('DELETE FROM chat_v1 WHERE user_id = ?', userEmail);
    await db.runAsync('DELETE FROM avisos_dispensados_v1 WHERE user_id = ?', userEmail);
    await db.runAsync('DELETE FROM edicoes_orfas_v1 WHERE user_id = ?', userEmail);
    await db.runAsync('DELETE FROM divisoes_v1 WHERE user_id = ?', userEmail);
    await db.runAsync('DELETE FROM divisoes_orfas_v1 WHERE user_id = ?', userEmail);

    for (const f of backup.faturas) {
      await db.runAsync('INSERT OR REPLACE INTO faturas_v2 (user_id, mes, data) VALUES (?, ?, ?)', [
        userEmail,
        f.mes,
        JSON.stringify(f.data),
      ]);
    }
    for (const e of backup.estado) {
      await db.runAsync(
        'INSERT OR REPLACE INTO estado_v2 (user_id, mes, dono, oculto, pago) VALUES (?, ?, ?, ?, ?)',
        [userEmail, e.mes, e.dono, e.oculto ? 1 : 0, e.pago ? 1 : 0],
      );
    }
    for (const ed of backup.edicoes) {
      await db.runAsync(
        `INSERT INTO edicoes_v1 (user_id, mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userEmail,
          ed.mes,
          ed.item_desc,
          ed.item_data,
          ed.item_valor,
          ed.novo_dono,
          ed.nova_desc,
          ed.deletado ? 1 : 0,
        ],
      );
    }
    const now = Date.now();
    for (let i = 0; i < backup.chat.length; i++) {
      const c = backup.chat[i];
      await db.runAsync(
        'INSERT INTO chat_v1 (user_id, mes, role, content, is_hidden, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userEmail, c.mes, c.role, c.content, c.is_hidden ? 1 : 0, now + i],
      );
    }
    for (const a of backup.avisosDispensados ?? []) {
      await db.runAsync(
        'INSERT OR REPLACE INTO avisos_dispensados_v1 (user_id, mes, titulo, valor, soma) VALUES (?, ?, ?, ?, ?)',
        [userEmail, a.mes, a.titulo, a.valor, a.soma],
      );
    }
    for (const ed of backup.edicoesOrfas ?? []) {
      await db.runAsync(
        `INSERT INTO edicoes_orfas_v1 (user_id, mes, item_desc, item_data, item_valor, novo_dono, nova_desc, deletado, detectado_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userEmail,
          ed.mes,
          ed.item_desc,
          ed.item_data,
          ed.item_valor,
          ed.novo_dono,
          ed.nova_desc,
          ed.deletado ? 1 : 0,
          ed.detectado_em,
        ],
      );
    }
    for (const d of backup.divisoes ?? []) {
      await db.runAsync(
        'INSERT INTO divisoes_v1 (user_id, mes, item_desc, item_data, item_valor, pessoa, valor) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userEmail, d.mes, d.item_desc, d.item_data, d.item_valor, d.pessoa, d.valor],
      );
    }
    for (const d of backup.divisoesOrfas ?? []) {
      await db.runAsync(
        `INSERT INTO divisoes_orfas_v1 (user_id, mes, item_desc, item_data, item_valor, pessoa, valor, detectado_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userEmail,
          d.mes,
          d.item_desc,
          d.item_data,
          d.item_valor,
          d.pessoa,
          d.valor,
          d.detectado_em,
        ],
      );
    }
  });

  await Promise.all([
    saveCategorias(userEmail, backup.config.categorias),
    saveRegras(userEmail, backup.config.regras),
    saveAssinaturas(userEmail, backup.config.assinaturas),
    savePixKey(userEmail, backup.config.pixKey),
    saveOrcamentos(userEmail, backup.config.orcamentos ?? {}),
    saveOrcamentoAlertas(userEmail, backup.config.orcamentoAlertas ?? {}),
  ]);
}
