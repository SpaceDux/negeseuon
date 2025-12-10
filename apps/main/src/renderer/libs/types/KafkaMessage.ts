export type KafkaMessage = {
  offset: number;
  partition: number;
  key: string;
  timestamp: string;
  payload: any; // Can be string, object, or any deserialized value
  size: number;
  headers: Record<string, string> | null;
};
