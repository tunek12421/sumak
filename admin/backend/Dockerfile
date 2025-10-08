# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy source code first
COPY go.mod ./
COPY main.go ./

# Download dependencies
RUN go mod download
RUN go mod tidy

# Build
RUN go build -o admin-api main.go

# Run stage
FROM alpine:latest

WORKDIR /root/

# Copy binary
COPY --from=builder /app/admin-api .

# Expose port
EXPOSE 8081

# Run
CMD ["./admin-api"]
