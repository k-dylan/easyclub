TESTS = $(shell find test -type f -name "*.test.js")

install:
	@npm install

test: 
	@./node_modules/mocha/bin/mocha \
		--harmony-async-await \
		$(TESTS)


.PHONY: test
