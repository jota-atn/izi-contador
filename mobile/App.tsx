import "./global.css";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { getRelatorio, RelatorioFatura } from "./src/api";

const COLORS = ["#7C3AED", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#6366F1"];
const SCREEN_W = Dimensions.get("window").width;

export default function App() {
  const [dados, setDados] = useState<RelatorioFatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const carregar = () => {
    setLoading(true);
    setError(null);
    getRelatorio()
      .then(setDados)
      .catch((err) => {
        if (err?.status === 401) {
          setError("Sessão do Google expirada. Reinicie o backend para reautenticar.");
        } else {
          setError("Erro ao conectar com o backend.");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const copiarResumo = () => {
    if (!dados) return;
    const texto = dados.relatorio_por_pessoa
      .map((p) => {
        const itens = p.itens.map((i) => `${i.descricao} - ${i.valor.toFixed(2)}`).join("\n");
        return `${p.dono}\n${itens}\nTotal = ${p.total_individual.toFixed(2)}`;
      })
      .join("\n\n");
    Clipboard.setString(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text className="text-slate-400 mt-4 font-semibold">Sincronizando faturas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900 px-8">
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Text className="text-red-400 text-5xl mb-4">⚠️</Text>
        <Text className="text-white text-lg font-bold text-center mb-6">{error}</Text>
        <TouchableOpacity
          onPress={carregar}
          className="bg-purple-600 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-bold uppercase tracking-wider text-sm">
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = (dados?.relatorio_por_pessoa ?? []).map((p, i) => ({
    name: p.dono,
    population: p.total_individual,
    color: COLORS[i % COLORS.length],
    legendFontColor: "#94a3b8",
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
        <View className="flex-row items-center gap-2">
          <View className="bg-purple-600 rounded-lg p-2">
            <Text className="text-white text-base">💳</Text>
          </View>
          <Text className="text-white text-xl font-black tracking-tight">
            Izi<Text className="text-purple-500">Contador</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={copiarResumo}
          className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
            copiado
              ? "bg-green-500/20 border-green-500"
              : "bg-slate-900 border-slate-700"
          }`}
        >
          <Text className={`text-xs font-bold uppercase tracking-wider ${copiado ? "text-green-400" : "text-slate-300"}`}>
            {copiado ? "✓ Copiado!" : "Copiar"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card total */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
            Fatura Total
          </Text>
          <Text className="text-white text-5xl font-black tracking-tighter mb-3">
            R$ {dados?.total_fatura.toFixed(2)}
          </Text>
          <View className="flex-row items-center self-start bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider">
              👥 {dados?.relatorio_por_pessoa.length} pessoas
            </Text>
          </View>
        </View>

        {/* Gráfico de pizza */}
        <View className="bg-slate-900 rounded-3xl p-6 border border-slate-800 items-center">
          <Text className="text-white text-sm font-bold uppercase tracking-wider mb-4 self-start">
            🥧 Divisão de Gastos
          </Text>
          <PieChart
            data={chartData}
            width={SCREEN_W - 64}
            height={180}
            chartConfig={{
              color: () => "#7C3AED",
              labelColor: () => "#94a3b8",
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            hasLegend={true}
          />
        </View>

        {/* Cards por pessoa */}
        {dados?.relatorio_por_pessoa.map((pessoa) => (
          <View
            key={pessoa.dono}
            className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden"
          >
            {/* Header do card */}
            <View className="bg-slate-800/50 px-6 py-4 flex-row items-center justify-between border-b border-slate-800">
              <View className="flex-row items-center gap-2">
                <View className="w-1.5 h-5 bg-purple-500 rounded-full" />
                <Text className="text-white font-black text-lg uppercase tracking-tight">
                  {pessoa.dono}
                </Text>
              </View>
              <Text className="text-purple-400 font-mono font-bold text-lg">
                R$ {pessoa.total_individual.toFixed(2)}
              </Text>
            </View>

            {/* Itens */}
            <View className="px-6 py-4 gap-3">
              {pessoa.itens.map((item, idx) => (
                <View key={idx} className="flex-row items-start justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-slate-200 text-xs font-bold uppercase tracking-tight">
                      {item.descricao}
                    </Text>
                    <Text className="text-slate-500 text-[10px] mt-0.5">{item.data}</Text>
                  </View>
                  <View className="bg-slate-800 px-2 py-1 rounded">
                    <Text className="text-slate-300 font-mono text-xs font-bold">
                      R$ {item.valor.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text className="text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] text-center mt-4">
          IziContador • Automático • 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
