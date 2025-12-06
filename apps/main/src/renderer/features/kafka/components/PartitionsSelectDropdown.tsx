import { Label } from "@renderer/libs/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/libs/shadcn/components/ui/select";
import { useMemo } from "react";
import useTopicMetadata from "../hooks/useTopicMetadata";
import { ConnectorConfiguration } from "@negeseuon/schemas";

type Props = {
  connection: ConnectorConfiguration;
  topic: string;
  onSelect: (partition: number | null) => void;
  value: number | null;
};

export default function PartitionsSelectDropdown({
  connection,
  topic,
  onSelect,
  value,
}: Props) {
  const { data: topicMetadata } = useTopicMetadata(connection, topic);

  const partitionsCount = useMemo(() => {
    const topics = topicMetadata?.topics;
    if (!topics) return 0;

    const topicData =
      topics instanceof Map
        ? topics.get(topic)
        : (topics as Record<string, { partitionsCount: number }>)[topic];

    return topicData?.partitionsCount ?? 0;
  }, [topicMetadata, topic]);

  const partitions = useMemo(() => {
    return Array.from({ length: partitionsCount }, (_, index) =>
      index.toString()
    );
  }, [partitionsCount, topic]);

  const handleSelect = (value: string) => {
    if (value === "all") {
      onSelect(null);
    } else {
      onSelect(parseInt(value));
    }
  };

  return (
    <>
      <Label htmlFor="partition" className="text-sm whitespace-nowrap">
        Partition:
      </Label>
      <Select
        value={value?.toString() ?? "all"}
        onValueChange={(value) => handleSelect(value)}
      >
        <SelectTrigger id="partition" size="sm" className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {partitions.map((partitionNum) => (
            <SelectItem key={partitionNum} value={partitionNum}>
              {partitionNum}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
