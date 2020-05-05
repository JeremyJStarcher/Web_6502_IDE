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
	cd sources/ide && npm ci && npm run fix
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

	cd sources/ide && make clean all 

	cp sources/ide/*.html ${IDEST}
	cp sources/ide/*.ico ${IDEST}
	cp sources/ide/lib/ts/wasmdetect.js  ${ILIB}/ts 
	cp sources/ide/lib/*.css  ${ILIB} 
	cp sources/ide/font/*.woff ${IDEST}/font
	cp sources/ide/lib/codemirror  ${ILIB}/codemirror -R
	cp sources/ide/lib/ts/dasm-bundle.*  ${ILIB}/ts 
	cp sources/ide/lib/ts/main-bundle.*  ./${ILIB}/ts 

	cp sources/web_dasm/dasm-exe.*  ${IDEST} 


	cp sources/v6502/v6502.*  ./${IDEST} 
	mkdir -p ${IDEST}/systems/fantasy-console
	cp -r sources/systems/fantasy_console/build/* ${IDEST}/systems/fantasy-console
	mkdir -p ${IDEST}/examples
	cp -r sources/ide/examples/fantasy/* ${IDEST}/examples
	
asmjs:	build
wasm:	build

run: wasm
	cd dist/wasm && http-server

clean:
	rm -rf ${DEST}/asmjs
	rm -rf ${DEST}/wasm
	cd sources/ide && make clean
	cd sources/web_dasm && make clean
	cd sources/v6502 && make clean
	cd sources/systems/fantasy_console && make clean
	cd sources/dasm && make clean
