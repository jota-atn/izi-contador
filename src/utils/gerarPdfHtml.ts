import { RelatorioFatura, Gasto } from '../types';
import { formatMesAno, formatSincronizacao } from './meses';
import { SEM_CATEGORIA, SEM_CATEGORIA_LABEL } from '../parser/parseFatura';

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function brl(value: number): string {
  const str = value.toFixed(2);
  const [int, dec] = str.split('.');
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$&nbsp;${formattedInt},${dec}`;
}

function renderItem(item: Gasto, even: boolean): string {
  const parcelaMatch = / - (\d+\/\d+)$/.exec(item.descricao);
  const desc = parcelaMatch ? item.descricao.slice(0, parcelaMatch.index) : item.descricao;
  const parcela = parcelaMatch ? parcelaMatch[1] : '';
  const bg = even ? 'background:#f8fafc;' : '';
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 20px;border-bottom:1px solid #f1f5f9;${bg}">
      <div style="flex:1;font-size:12.5px;color:#334155;padding-right:16px;line-height:1.4;">
        ${esc(desc)}${parcela ? `<span style="font-size:11px;color:#94a3b8;margin-left:5px;">${parcela}</span>` : ''}
      </div>
      <div style="font-size:13px;font-weight:600;color:#0f172a;white-space:nowrap;">${brl(item.valor)}</div>
    </div>`;
}

function renderPessoa(dono: string, itens: Gasto[], total: number, pago: boolean): string {
  const badge = pago
    ? `<span style="background:#166534;color:#bbf7d0;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:0.4px;">PAGO</span>`
    : `<span style="background:#7c2d12;color:#fed7aa;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:0.4px;">PENDENTE</span>`;
  const itensList = itens.map((item, i) => renderItem(item, i % 2 === 1)).join('');
  return `
    <div style="background:white;border-radius:12px;margin-bottom:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
      <div style="background:#0f172a;padding:13px 20px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:14px;font-weight:800;color:white;letter-spacing:0.3px;">${esc(dono)}</div>
        <div style="display:flex;align-items:center;gap:10px;">
          ${badge}
          <div style="font-size:16px;font-weight:700;color:#a78bfa;">${brl(total)}</div>
        </div>
      </div>
      <div>${itensList}</div>
    </div>`;
}

export function gerarPdfHtml(
  dados: RelatorioFatura,
  estadoPorPessoa: Record<string, { pago: boolean }>,
  iconBase64: string,
): string {
  const pessoas = dados.relatorio_por_pessoa;

  const { totalPago, qtdPago, totalPendente, qtdPendente } = pessoas.reduce(
    (acc, p) => {
      if (estadoPorPessoa[p.dono]?.pago) {
        acc.totalPago += p.total_individual;
        acc.qtdPago += 1;
      } else {
        acc.totalPendente += p.total_individual;
        acc.qtdPendente += 1;
      }
      return acc;
    },
    { totalPago: 0, qtdPago: 0, totalPendente: 0, qtdPendente: 0 },
  );

  const pct = dados.total_fatura > 0 ? Math.round((totalPago / dados.total_fatura) * 100) : 0;

  const sincStr = dados.sincronizadoEm
    ? `<div style="font-size:12px;color:#94a3b8;margin-top:3px;">sinc. ${formatSincronizacao(dados.sincronizadoEm)}</div>`
    : '';

  const iconSrc = iconBase64 ? `data:image/png;base64,${iconBase64}` : '';

  const now = new Date();
  const geradoEm =
    now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' às ' +
    now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const pessoasHtml = pessoas
    .map((p) =>
      renderPessoa(
        p.dono === SEM_CATEGORIA ? SEM_CATEGORIA_LABEL : p.dono,
        p.itens,
        p.total_individual,
        estadoPorPessoa[p.dono]?.pago ?? false,
      ),
    )
    .join('');

  const pagoLabel = `${qtdPago} ${qtdPago === 1 ? 'paga' : 'pagas'}`;
  const pendLabel = `${qtdPendente} pendente${qtdPendente !== 1 ? 's' : ''}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div style="background:#0f172a;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:14px;">
      ${iconSrc ? `<img src="${iconSrc}" style="width:46px;height:46px;border-radius:10px;" />` : ''}
      <div>
        <div style="font-size:22px;font-weight:800;color:white;letter-spacing:-0.5px;">
          I<span style="color:#7c3aed;">zi</span>Contador
        </div>
        <div style="font-size:11px;color:#64748b;margin-top:1px;letter-spacing:0.3px;">DIVISÃO DE FATURA</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:18px;font-weight:700;color:white;">${formatMesAno(dados.mes).toUpperCase()}</div>
      ${sincStr}
    </div>
  </div>

  <!-- CONTENT -->
  <div style="padding:20px 24px;">

    <!-- RESUMO -->
    <div style="background:white;border-radius:12px;padding:18px 22px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;">
        <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.6px;">Total da fatura</div>
        <div style="font-size:28px;font-weight:800;color:#0f172a;">${brl(dados.total_fatura)}</div>
      </div>
      <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:10px;">
        <div style="height:100%;width:${pct}%;background:#7c3aed;border-radius:4px;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="width:8px;height:8px;border-radius:50%;background:#7c3aed;"></div>
          <span style="font-size:12px;color:#64748b;">${pagoLabel}</span>
          <span style="font-size:12px;font-weight:700;color:#0f172a;">&nbsp;${brl(totalPago)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="width:8px;height:8px;border-radius:50%;background:#e2e8f0;border:1.5px solid #94a3b8;"></div>
          <span style="font-size:12px;color:#64748b;">${pendLabel}</span>
          <span style="font-size:12px;font-weight:700;color:#0f172a;">&nbsp;${brl(totalPendente)}</span>
        </div>
      </div>
    </div>

    <!-- PESSOAS -->
    ${pessoasHtml}

    <!-- FOOTER -->
    <div style="text-align:center;padding:16px 0 8px;color:#94a3b8;font-size:11px;">
      Gerado pelo <span style="color:#7c3aed;font-weight:700;">IziContador</span> em ${geradoEm}
    </div>

  </div>
</body>
</html>`;
}
