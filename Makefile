TESTS = $(shell find test -type f -name "*.test.js")

install:
	@npm install


test: 
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--harmony-async-await \
		$(TESTS)

build: 
	@./node_modules/loader-builder/bin/builder ./views .



.PHONY: test build
