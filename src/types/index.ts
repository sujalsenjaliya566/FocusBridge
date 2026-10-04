export interface AnalogyProfile {
  id: string;
  name: string;
  category: string;
  promptAnchor: string;
}

export interface MechanicsStep {
  phase: string;
  explanation: string;
}

export interface CheckpointQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CognitiveAnalysis {
  coreTakeaway: string;
  mechanics: MechanicsStep[];
  analogy: string;
  checkpoint: CheckpointQuiz;
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  enableFixation: boolean;
  enableRuler: boolean;
  selectedProfileId: string;
  engineMode: "webllm" | "ollama";
  ollamaEndpoint: string;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface EngineProgress {
  text: string;
  percent: number;
}
