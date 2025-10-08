# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Download dependencies and tidy
RUN go mod tidy && go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy database schema
COPY --from=builder /app/database/schema.sql ./database/

# Create uploads directory
RUN mkdir -p /root/uploads

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"]
