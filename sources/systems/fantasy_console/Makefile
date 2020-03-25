
#GOPTI= -O -m32 # -O for more warnings; use -O0 for debugging, use -O3 for speed

GWARN= -ansi -std=c99 -pedantic -Wall \
       -Wstrict-prototypes -Wdeclaration-after-statement \
       -Wold-style-definition -Wmissing-declarations -Wmissing-prototypes \
       -Wshadow -Wwrite-strings -Wcast-qual -Wnested-externs \
       -Wcast-align -Wpointer-arith -Wbad-function-cast \
       -Wformat-y2k -Wformat-nonliteral -Wformat-security \
       -Wfloat-equal -Wundef -Winline \
       # -Wfour-char-constants # Apple OS X only option, not needed anyway?
       # -Wunused # definition is weird in man gcc, effect is weird too
       # -Wextra -Wno-unused-parameter # no-unused tames extra a little
       # -Wunreachable-code # seems to create 4 spurious warnings?
       # -Wconversion # too many right now
       # -Wtraditional # too many, not sure if it's worth it anyway

# WASM_MODE: 0 -> Compile as ASM.js. Can be run from local file system
# WASM_MODE: 1 -> Compile as WASM. Must be served from webserver
WEB_DIST=build
WEB_NAME=fantasy-console
S=./c_src

# Set the correct compiler based upon the target
wasm: CC=emcc -O0
wasm: WASM_MODE=1
asmjs: CC=emcc -O0
asmjs: WASM_MODE=0

OBJS= ${S}/fc-main.o  ${S}/machine.o ${S}/fake6502.o
SRCS= ${S}/fc-main.c ${S}/machine.c ${S}/fake6502.c
$(OBJS): ${S}/fc-main.c ${S}/machine.c ${S}/fake6502.c

EMCC_OBJS= ${OBJS} # wasm_main.o
EMCC_SRCS = ${OBJS}# wasm_main.c

all: 
	echo "'wasm' or 'asmjs'?"
	false

run:
	(cd ../../../; make run)

rom:  
	../../../bin/dasm asm/bios.asm -f2 -oasm/bios.rom

EM_CFLAGS=-s USE_SDL=2 -s USE_SDL_IMAGE=2 -s USE_SDL_TTF=2 \
    --preload-file PixelOperatorMono.ttf@/ \
	-s INVOKE_RUN=0 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS="['_main', '_init_system', '_mainloop', '_boot_machine']" \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']" \
	--preload-file asm/bios.rom@/bios.rom

wasm: $(EMCC_OBJS) scripts rom
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.js -s WASM=$(WASM_MODE)  \
	${EM_CFLAGS} \
	$(LDFLAGS)

asmjs: $(EMCC_OBJS) scripts rom
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.js -s WASM=$(WASM_MODE)  \
	${EM_CFLAGS} \
	$(LDFLAGS)

scripts:
	npm run make2
	cp ts/fc-bundle.* build

obj: $(OBJS)


clean:
	-rm -rf ${S}/*.o $(ALL) \
	${WEB_DIST}/${WEB_NAME}.mjs \
	${WEB_DIST}/${WEB_NAME}.js \
	${WEB_DIST}/${WEB_NAME}.html \
	${WEB_DIST}/${WEB_NAME}.mem \
	${WEB_DIST}/${WEB_NAME}.js.mem \
	${WEB_DIST}/${WEB_NAME}.html.mem \
	${WEB_DIST}/${WEB_NAME}.data \
	${WEB_DIST}/${WEB_NAME}.wasm \
	${WEB_DIST}/${WEB_NAME}.data \
	asm/bios.rom
	npm run clean
	-rm build/fc-bundle.*
