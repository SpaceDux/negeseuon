# Kafka SASL Credentials

## Default Credentials

The Kafka cluster is configured with SASL/PLAIN authentication. Use these credentials to connect:

### Admin User (Full Access)

- **Username:** `admin`
- **Password:** `admin-secret`

### Producer User

- **Username:** `producer`
- **Password:** `producer-secret`

### Consumer User

- **Username:** `consumer`
- **Password:** `consumer-secret`

## Connection Details

- **Bootstrap Server:** `localhost:9092`
- **Security Protocol:** `SASL_PLAINTEXT`
- **SASL Mechanism:** `PLAIN`

## Usage in Your Application

When connecting from your application, use these settings:

```typescript
{
  brokers: ["localhost:9092"],
  sasl: {
    mechanism: "plain",
    username: "admin",
    password: "admin-secret"
  }
}
```

Or for the @platformatic/kafka library:

```typescript
{
  brokers: ["localhost:9092"],
  sasl: {
    mechanism: "plain",
    username: "admin",
    password: "admin-secret"
  }
}
```
