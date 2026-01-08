import {
  SelectTrigger,
  SelectValue,
  Select,
  SelectItem,
  SelectContent,
} from "@renderer/libs/shadcn/components/ui/select";
import { Label } from "@renderer/libs/shadcn/components/ui/label";
import { useState, useEffect } from "react";
import { Input } from "@renderer/libs/shadcn/components/ui/input";
import PartitionsSelectDropdown from "./PartitionsSelectDropdown";
import { Checkbox } from "@renderer/libs/shadcn/components/ui/checkbox";
import { ConnectorConfiguration } from "@negeseuon/schemas";

type Props = {
  connection: ConnectorConfiguration;
  topic: string;
  offset?: string;
  limit?: string;
  partition?: "all" | number;
  schemaRegistryDecode?: boolean;
  onChange: (
    offset: string,
    limit: string,
    partition: "all" | number,
    schemaRegistryDecode: boolean
  ) => void;
};
export default function FilterMessages(props: Props) {
  const {
    connection,
    topic,
    onChange,
    offset: propOffset,
    limit: propLimit,
    partition: propPartition,
    schemaRegistryDecode: propSchemaRegistryDecode,
  } = props;
  const [offset, setOffset] = useState<string>(propOffset ?? "earliest");
  const [limit, setLimit] = useState<string>(propLimit ?? "100");
  const [partition, setPartition] = useState<"all" | number>(
    propPartition ?? "all"
  );
  const [schemaRegistryDecode, setSchemaRegistryDecode] = useState<boolean>(
    propSchemaRegistryDecode ?? false
  );

  // Sync with props when they change
  useEffect(() => {
    if (propOffset !== undefined) setOffset(propOffset);
  }, [propOffset]);
  useEffect(() => {
    if (propLimit !== undefined) setLimit(propLimit);
  }, [propLimit]);
  useEffect(() => {
    if (propPartition !== undefined) setPartition(propPartition);
  }, [propPartition]);
  useEffect(() => {
    if (propSchemaRegistryDecode !== undefined)
      setSchemaRegistryDecode(propSchemaRegistryDecode);
  }, [propSchemaRegistryDecode]);

  const handleOffsetChange = (value: string) => {
    setOffset(value);
    onChange(value, limit, partition, schemaRegistryDecode);
  };

  const handleLimitChange = (value: string) => {
    setLimit(value);
    onChange(offset, value, partition, schemaRegistryDecode);
  };

  const handlePartitionChange = (value: "all" | number) => {
    setPartition(value);
    onChange(offset, limit, value, schemaRegistryDecode);
  };

  const handleSchemaRegistryDecodeChange = (value: boolean) => {
    setSchemaRegistryDecode(value);
    onChange(offset, limit, partition, value);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Label htmlFor="offset" className="text-sm whitespace-nowrap">
          Offset:
        </Label>
        <Select value={offset} onValueChange={handleOffsetChange}>
          <SelectTrigger id="offset" size="sm" className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="earliest">Earliest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="limit" className="text-sm whitespace-nowrap">
          Limit:
        </Label>
        <Input
          id="limit"
          type="text"
          value={limit}
          onChange={(e) => handleLimitChange(e.target.value)}
          className="w-[80px] h-8"
        />
      </div>

      <div className="flex items-center gap-2">
        <PartitionsSelectDropdown
          connection={connection}
          topic={topic}
          onSelect={(partition) => handlePartitionChange(partition ?? "all")}
          value={partition === "all" ? null : partition}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="avro-decode"
          checked={schemaRegistryDecode}
          onCheckedChange={(checked: boolean) =>
            handleSchemaRegistryDecodeChange(checked)
          }
        />
        <Label htmlFor="avro-decode" className="text-sm cursor-pointer">
          Schema Registry Decode
        </Label>
      </div>
    </>
  );
}
