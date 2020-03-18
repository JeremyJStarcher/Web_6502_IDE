
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
WEB_DIST=.
WEB_NAME=fantasy-console
S=.

# Set the correct compiler based upon the target
wasm: CC=emcc -Os
wasm: WASM_MODE=1
asmjs: CC=emcc -Os
asmjs: WASM_MODE=0

OBJS= ${S}/machine.o ${S}/fake6502.o
SRCS= ${S}/machine.c $[S}/fake6502.c

EMCC_OBJS= ${OBJS}
EMCC_SRCS = ${OBJS} 

ALL=dasm 

CMD=$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.js -s WASM=$(WASM_MODE)  \

all: $(ALL)

dasm: $(OBJS)
	$(CC) $(OBJS) -o dasm $(LDFLAGS)

wasm: $(EMCC_OBJS)
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.js -s WASM=$(WASM_MODE)  \
	-s INVOKE_RUN=0 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS="['_read6502', '_write6502', '_js_step6502', '_reset6502']" \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']" \
	--bind \
	$(LDFLAGS)

asmjs: $(EMCC_OBJS)
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.js -s WASM=$(WASM_MODE)  \
	-s INVOKE_RUN=0 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS="['_read6502', '_write6502', '_js_step6502', '_reset6502']" \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']" \
	--bind \
	$(LDFLAGS)


obj: $(OBJS)

clean:
	rm -rf ${S}/*.o $(ALL) \
	dasm-alpha-*.tar.gz \
	*.gcda *.gcno *.gcov gmon.out \
	*.o ${WEB_DIST}/${WEB_NAME}.mjs \
	*.o ${WEB_DIST}/${WEB_NAME}.js \
	*.o ${WEB_DIST}/${WEB_NAME}.js.mem \
	*.o ${WEB_DIST}/${WEB_NAME}.data \
	*.o ${WEB_DIST}/${WEB_NAME}.wasm \
	*.o ${WEB_DIST}/${WEB_NAME}.data
