DEST=dist
wasm: MODE=wasm
asmjs: MODE=asmjs

IDEST=${DEST}/${MODE}
ILIB=${IDEST}/lib

.PHONY: build wasm asmjs

all:
	echo "Use 'make bootstrap' to set up the build environment with needed software"
	echo "for the rest of the build process to use."
	echo " "
	echo "Files created as part of bootstrap are not removed during"
	echo "'make clean'"
	echo " "
	echo "After that it is either:"
	echo " make wasm   # to make the wasm version"
	echo " make asmjs"
	echo " 'make run'  # to make and run."

bootstrap:
	cd sources/web && npm ci && npm run fix
	cd sources/systems/fantasy_console && npm ci && npm run fix
	cd sources/dasm/ && make
	cp sources/dasm/src/dasm ./bin/dasm
	make clean

build:
	rm -rf ${IDEST}
	mkdir -p ${IDEST}/font
	mkdir -p ${IDEST}/systems
	mkdir -p ${ILIB}
	mkdir -p ${ILIB}/ts

	echo "window.WASM_FLAG='${MODE}' === 'wasm';" >> ${ILIB}/wasm-mode.js

	cd sources/web_dasm && make clean ${MODE}
	cd sources/v6502 && make clean ${MODE}
	cd sources/systems/fantasy_console && make clean ${MODE}

	cd sources/web && make clean all 

	cp sources/web/*.html ${IDEST}
	cp sources/web/*.ico ${IDEST}

	cp sources/web/lib/ts/wasmdetect.js  ${ILIB}/ts 
	cp sources/web/lib/*.css  ${ILIB} 
	cp sources/web/font/*.woff ${IDEST}/font

	cp sources/web/lib/codemirror  ${ILIB}/codemirror -R

	cp sources/web/lib/ts/dasm-bundle.*  ${ILIB}/ts 
	cp sources/web_dasm/dasm-exe.*  ${IDEST} 

	cp sources/web/lib/ts/main-bundle.*  ./${ILIB}/ts 
	cp sources/v6502/v6502.*  ./${IDEST} 
	mkdir -p ${IDEST}/systems/fantasy-console
	cp -r sources/systems/fantasy_console/build/* ${IDEST}/systems/fantasy-console
	
asmjs:	build
wasm:	build

run: wasm
	cd dist/wasm && http-server

clean:
	rm -rf ${DEST}/asmjs
	rm -rf ${DEST}/wasm
	cd sources/web && make clean
	cd sources/web_dasm && make clean
	cd sources/v6502 && make clean
	cd sources/systems/fantasy_console && make clean
	cd sources/dasm && make clean
