#!/bin/bash

# Script to produce a message to a Kafka topic
# Usage: ./produce-message.sh [topic-name] [message] [username] [password]

TOPIC="${1:-topic-1}"
MESSAGE="${2:-Hello from Kafka!}"
USERNAME="${3:-admin}"
PASSWORD="${4:-admin-secret}"

# Check if Kafka is running
if ! docker ps | grep -q kafka; then
    echo "Error: Kafka container is not running. Please start it with: docker-compose up -d"
    exit 1
fi

# Create client properties file for SASL authentication
docker exec kafka bash -c "cat > /tmp/producer.properties <<EOF
security.protocol=SASL_PLAINTEXT
sasl.mechanism=PLAIN
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username=\"$USERNAME\" password=\"$PASSWORD\";
EOF"

# Produce message using kafka-console-producer
echo "$MESSAGE" | docker exec -i kafka kafka-console-producer \
    --bootstrap-server localhost:9092 \
    --topic "$TOPIC" \
    --producer.config /tmp/producer.properties

echo "Message sent to topic '$TOPIC': $MESSAGE"

