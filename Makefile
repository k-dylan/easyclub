TESTS = $(shell find test -type f -name "*.test.js")

install:
	@npm install

test: 
	@mocha --compilers js:babel-core/register \
		$(TESTS)


.PHONY: test
