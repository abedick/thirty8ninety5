GOCMD=go
GOBUILD=$(GOCMD) build
GOGET=$(GOCMD) get
BINARY_NAME=webserver

# all: deps build
all: build

run: build exe

exe:
	./bin/webserver

build: 
	$(GOBUILD) -o ./bin/$(BINARY_NAME) ./src/
clean: 
	rm -f ./$(BINARY_NAME)

# deps:
	# $(GOGET) github.com/gorilla/mux
	# $(GOGET) github.com/rs/xid