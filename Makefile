NAME := zotag
VERSION := 1.0.6
XPI := dist/$(NAME)-$(VERSION).xpi
FILES := manifest.json bootstrap.js zotag.js zotag.css icons LICENSE README.md

.PHONY: all package test verify clean

all: test package verify

package: $(XPI)

$(XPI): $(shell find $(FILES) -type f)
	mkdir -p dist
	(cd . && zip -X -r -9 "$(abspath $@)" $(FILES))
	xattr -c "$@" 2>/dev/null || true

test:
	node --check bootstrap.js
	node --check zotag.js
	node --test tests/zotag.test.js
	python3 -m json.tool manifest.json >/dev/null
	python3 -m json.tool updates.json >/dev/null

verify: $(XPI)
	unzip -t "$(XPI)" >/dev/null
	test "$$(jq -r '.addons["zotag@arrancurran.github.io"].updates[0].update_hash' updates.json)" = "sha256:$$(shasum -a 256 "$(XPI)" | cut -d' ' -f1)"

clean:
	rm -f "$(XPI)"
