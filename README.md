# Time Server

HTTP Time Server that returns the current server time

## Terminology

- `t0`: time when the client sends the request
- `t1`: time when the server receives the request
- `t2`: time when the server sends the response
- `t3`: time when the client receives the response

## How it works

1. The Client sends a request `GET /tt` to the server.

The server is written in Go and returns the current time in the following format:

```plaintext
18446744073709551615$18446744073709551615
```

The Client can parse the response by splitting the string by `$` and converting the first part to `t1` and the second part to `t2`.

The Client can calculate offset by the following formula:

```plaintext
offset = (t1 - t0 + t2 - t3) / 2;
```

The Client also can calculate sync error by the following formula:

```plaintext
error = Math.abs(t3 - t0 - (t2 - t1)) / 2;
```

The Client repeats the request several times and calculates and records the offset and error for each request.

After that client calculates the confidence interval using the [Intersection algorithm](https://en.wikipedia.org/wiki/Intersection_algorithm).
