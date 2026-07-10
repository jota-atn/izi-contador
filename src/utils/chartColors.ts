// Paleta categórica validada (CVD-safe, ordem fixa) contra o fundo dos cards
// (#0f172a) — ver skill de dataviz. Além do 8º item, cai numa cor neutra em
// vez de repetir uma cor já usada por outra pessoa.
export const CHART_COLORS = [
  '#3987e5',
  '#199e70',
  '#c98500',
  '#008300',
  '#9085e9',
  '#e66767',
  '#d55181',
  '#d95926',
];

export const CHART_COLORS_RGB = [
  '57, 135, 229',
  '25, 158, 112',
  '201, 133, 0',
  '0, 131, 0',
  '144, 133, 233',
  '230, 103, 103',
  '213, 81, 129',
  '217, 89, 38',
];

export const CHART_COLOR_OUTROS = '#64748b';
export const CHART_COLOR_OUTROS_RGB = '100, 116, 139';

export function corCategorica(indice: number): string {
  return CHART_COLORS[indice] ?? CHART_COLOR_OUTROS;
}

export function corCategoricaRgb(indice: number): string {
  return CHART_COLORS_RGB[indice] ?? CHART_COLOR_OUTROS_RGB;
}
