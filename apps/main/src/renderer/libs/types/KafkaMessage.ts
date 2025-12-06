export type KafkaMessage = {
  offset: number;
  partition: number;
  key: string;
  timestamp: string;
  payload: string;
  size: number;
  headers: Record<string, string> | null;
};
