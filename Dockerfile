FROM golang:alpine AS builder

WORKDIR /app
ADD . /app
RUN go build -o /app/main.exe .

EXPOSE 8080
ENTRYPOINT ["/app/main.exe"]
