FROM docker.io/golang:alpine

WORKDIR /app
ADD . /app
RUN go build -o /app/main.exe .

EXPOSE 8080
ENTRYPOINT ["/app/main.exe"]
