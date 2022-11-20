FROM golang:alpine AS builder

WORKDIR /app
ADD . /app

RUN go build -o /main.exe .

FROM scratch

COPY --from=builder /main.exe /

EXPOSE 8080
ENTRYPOINT ["/main.exe"]
