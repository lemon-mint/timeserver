package main

import (
	"log"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/julienschmidt/httprouter"
	"github.com/lemon-mint/envaddr"
	"github.com/valyala/bytebufferpool"
	"v8.run/go/exp/signal2"
	"v8.run/go/exp/time2/timeutil"
)

func main() {
	ln, err := net.Listen("tcp", envaddr.Get(":8080"))
	if err != nil {
		panic(err)
	}
	defer ln.Close()
	log.Println("Listening on", ln.Addr())

	r := httprouter.New()
	server := &http.Server{Handler: r}

	r.GET("/tt", TimeHandler)
	r.HandlerFunc("GET", "/time", timeutil.TimeHandler)

	go server.Serve(ln)
	signal2.WaitForInterrupt()
	log.Println("Shutting down...")
}

func TimeHandler(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	t1 := time.Now()

	w.WriteHeader(http.StatusOK)
	b := bytebufferpool.Get()
	// Time Format: 18446744073709551615$18446744073709551615
	const TimeFormatMaxLen = 40 + 2
	if cap(b.B) < TimeFormatMaxLen {
		b.B = make([]byte, 0, TimeFormatMaxLen)
	}
	b.B = b.B[:0]

	b.B = append(b.B, strconv.FormatUint(uint64(t1.UnixNano()), 10)...)
	b.B = append(b.B, '$')
	t2 := time.Now()
	b.B = append(b.B, strconv.FormatUint(uint64(t2.UnixNano()), 10)...)

	w.Write(b.B)
	bytebufferpool.Put(b)
}
