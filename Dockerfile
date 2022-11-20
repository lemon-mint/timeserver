FROM docker.io/golang:alpine as build

WORKDIR /app
ADD . /app
RUN CGO_ENABLED=0 go build -v -o /app/main.exe .

FROM gcr.io/distroless/static-debian11

COPY --from=build /app/main.exe /
EXPOSE 8080

CMD ["/main.exe"]
