import { MaterialIcons } from "@expo/vector-icons";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  type: "video" | "exercise" | "quiz";
};

export type Module = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  lessons: Lesson[];
};

export const modules: Module[] = [
  {
    id: "1",
    title: "Fundamentos Matemáticos",
    description: "Base sólida para todo o curso",
    icon: "menu-book",
    color: "#3B82F6",
    lessons: [
      {
        id: "1-1",
        title: "Conjuntos numéricos",
        description:
          "Apresentação dos principais conjuntos numéricos (naturais, inteiros, racionais, irracionais e reais), entendendo suas diferenças e aplicações.",
        duration: "12 min",
        videoUrl: "https://www.youtube.com/watch?v=s5Xv1SIQnQE",
        type: "video",
      },
      {
        id: "1-2",
        title: "Operações básicas",
        description: "Revisão das quatro operações básicas.",
        duration: "23 min",
        videoUrl: "https://www.youtube.com/watch?v=h3sFlP8Rmqc",
        type: "video",
      },
      {
        id: "1-3",
        title: "Frações",
        description:
          "Compreensão do conceito de fração e operações entre frações.",
        duration: "17 min",
        videoUrl: "https://www.youtube.com/watch?v=1t9qwYD4p90",
        type: "video",
      },
      {
        id: "1-4",
        title: "Porcentagem básica",
        description: "Aula de porcentagem baseada em exercícios.",
        duration: "8 min",
        videoUrl: "https://www.youtube.com/watch?v=azedx0uou64",
        type: "video",
      },
    ],
  },

  {
    id: "2",
    title: "Álgebra Básica",
    description: "Introdução à linguagem algébrica",
    icon: "functions",
    color: "#22C55E",
    lessons: [
      {
        id: "2-1",
        title: "Introdução à álgebra",
        description:
          "Compreensão da álgebra como uma ferramenta para generalizar cálculos e representar situações matemáticas.",
        duration: "13 min",
        videoUrl: "https://www.youtube.com/watch?v=QWCOdt6ZslU",
        type: "video",
      },
      {
        id: "2-2",
        title: "Variáveis",
        description:
          "Compreensão do uso de letras para representar valores desconhecidos em expressões e equações.",
        duration: "8 min",
        videoUrl: "https://www.youtube.com/watch?v=tc9_u7ipXo4",
        type: "video",
      },
      {
        id: "2-3",
        title: "Expressões algébricas",
        description:
          "Nesta aula, você aprenderá o conceito por meio de exemplos práticos e resolução de exercícios.",
        duration: "9 min",
        videoUrl: "https://www.youtube.com/watch?v=8NNA-8rimNs",
        type: "video",
      },
      {
        id: "2-4",
        title: "Valor numérico",
        description:
          "Cálculo do valor de uma expressão algébrica por meio da substituição correta das variáveis.",
        duration: "8 min",
        videoUrl: "https://www.youtube.com/watch?v=hPrWWSLdaCM",
        type: "video",
      },
      {
        id: "2-5",
        title: "Simplificação de expressões",
        description:
          "Redução de expressões algébricas usando operações básicas e termos semelhantes.",
        duration: "20 min",
        videoUrl: "https://www.youtube.com/watch?v=4-P_0p17sGM",
        type: "video",
      },
      {
        id: "2-6",
        title: "Produtos notáveis",
        description:
          "Introdução aos produtos notáveis mais comuns, reconhecendo padrões algébricos.",
        duration: "12 min",
        videoUrl: "https://www.youtube.com/watch?v=UECy1XbL6w8",
        type: "video",
      },
    ],
  },

  {
    id: "3",
    title: "Equações",
    description: "Resolução de equações do 1º grau",
    icon: "calculate",
    color: "#F97316",
    lessons: [
      {
        id: "3-1",
        title: "Igualdade e equação",
        description: "Entendimento do conceito de igualdade.",
        duration: "12 min",
        videoUrl: "https://www.youtube.com/watch?v=bWJrg5DyuMY",
        type: "video",
      },
      {
        id: "3-2",
        title: "Equações do 1º grau",
        description:
          "Resolução passo a passo de equações do 1º grau utilizando propriedades da igualdade.",
        duration: "6 min",
        videoUrl: "https://www.youtube.com/watch?v=x4k8950MVeg",
        type: "video",
      },
      {
        id: "3-3",
        title: "Equações com frações",
        description:
          "Resolução de equações do 1º grau que envolvem frações e denominadores.",
        duration: "7 min",
        videoUrl: "https://www.youtube.com/watch?v=EfGhgnfeWq0",
        type: "video",
      },
      {
        id: "3-4",
        title: "Problemas com equações",
        description:
          "Modelagem e resolução de problemas do cotidiano usando equações do 1º grau.",
        duration: "8 min",
        videoUrl: "https://www.youtube.com/watch?v=iUrjKc8VDlw",
        type: "video",
      },
      {
        id: "3-5",
        title: "Equações literais",
        description:
          "Isolamento de variáveis em fórmulas simples, preparando para conteúdos futuros.",
        duration: "10 min",
        videoUrl: "https://www.youtube.com/watch?v=MB5YBLYF1ZM",
        type: "video",
      },
    ],
  },

  {
    id: "4",
    title: "Proporcionalidade",
    description: "Razão, proporção e regra de três",
    icon: "balance",
    color: "#EF4444",
    lessons: [
      {
        id: "4-1",
        title: "Razão",
        description:
          "Estudo da razão como forma de comparação entre grandezas.",
        duration: "9 min",
        videoUrl: "https://www.youtube.com/watch?v=MvoCTWC3aoY",
        type: "video",
      },
      {
        id: "4-2",
        title: "Proporção",
        description:
          "Compreensão das proporções e sua relação com situações equivalentes.",
        duration: "10 min",
        videoUrl: "https://www.youtube.com/watch?v=GjxEHeAKWAU",
        type: "video",
      },
      {
        id: "4-3",
        title: "Regra de três simples",
        description:
          "Aplicação da regra de três simples em problemas diretos e inversos.",
        duration: "7 min",
        videoUrl: "https://www.youtube.com/watch?v=q846Qdi-od8",
        type: "video",
      },
      {
        id: "4-4",
        title: "Grandezas diretamente e inversamente proporcionais",
        description:
          "Estudo das grandezas diretamente e inversamente proporcionais, compreendendo como a variação de uma grandeza afeta a outra.",
        duration: "16 min",
        videoUrl: "https://www.youtube.com/watch?v=XVPo3mD3LIU",
        type: "video",
      },
      {
        id: "4-5",
        title: "Regra de três composta",
        description:
          "Introdução à regra de três composta envolvendo mais de duas grandezas.",
        duration: "20 min",
        videoUrl: "https://www.youtube.com/watch?v=5QVTHHAvBFI",
        type: "video",
      },
    ],
  },

  {
    id: "5",
    title: "Funções",
    description: "Introdução ao estudo de funções",
    icon: "show-chart",
    color: "#8B5CF6",
    lessons: [
      {
        id: "5-1",
        title: "Noção de função",
        description:
          "Introdução ao conceito de função como relação entre duas variáveis.",
        duration: "10 min",
        videoUrl: "https://youtu.be/OkgwaatIDMU?si=mE6Zvu4x1quyUYgS&t=19",
        type: "video",
      },
      {
        id: "5-2",
        title: "Domínio, imagem e contradomínio",
        description:
          "Compreensão dos conceitos de domínio, imagem e contradomínio de uma função.",
        duration: "15 min",
        videoUrl: "https://www.youtube.com/watch?v=GkuG8xZrYbs",
        type: "video",
      },
      {
        id: "5-3",
        title: "Função do 1º grau",
        description:
          "Estudo da estrutura da função do 1º grau e interpretação de seus coeficientes.",
        duration: "17 min",
        videoUrl: "https://www.youtube.com/watch?v=nysu0K-VXR8",
        type: "video",
      },
      {
        id: "5-4",
        title: "Gráfico da função do 1º grau",
        description:
          "Construção e leitura do gráfico da função do 1º grau no plano cartesiano.",
        duration: "20 min",
        videoUrl: "https://www.youtube.com/watch?v=Wb0ceNgBM00",
        type: "video",
      },
      {
        id: "5-5",
        title: "Problemas com função do 1º grau",
        description:
          "Aplicação da função do 1º grau na resolução de problemas contextualizados.",
        duration: "9 min",
        videoUrl: "https://www.youtube.com/watch?v=4q2N2HzSivA",
        type: "video",
      },
    ],
  },
];

// Função para buscar módulo por ID
export function getModuleById(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

// Função para buscar aula por ID
export function getLessonById(
  moduleId: string,
  lessonId: string,
): Lesson | undefined {
  const module = getModuleById(moduleId);
  return module?.lessons.find((l) => l.id === lessonId);
}
