
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
WEB_DIST=build/.
WEB_NAME=fantasy-console
S=./src

# Set the correct compiler based upon the target
wasm: CC=emcc -Os
wasm: WASM_MODE=1
asmjs: CC=emcc -Os
asmjs: WASM_MODE=0

OBJS= ${S}/fc-main.o 
SRCS= ${S}/fc-main.c

EMCC_OBJS= ${OBJS} # wasm_main.o
EMCC_SRCS = ${OBJS}# wasm_main.c

ALL=dasm 


all: $(ALL)

dasm: $(OBJS)
	$(CC) $(OBJS) -o dasm $(LDFLAGS)

EM_CFLAGS=-s USE_SDL=2 -s USE_SDL_IMAGE=2 -s USE_SDL_TTF=2 \
    --preload-file PixelOperatorMono.ttf@/

wasm: $(EMCC_OBJS)
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.html -s WASM=$(WASM_MODE)  \
	${EM_CFLAGS} \
	$(LDFLAGS)

asmjs: $(EMCC_OBJS)
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.html -s WASM=$(WASM_MODE)  \
	${EM_CFLAGS} \
	$(LDFLAGS)

obj: $(OBJS)

$(OBJS): ${S}/fc-main.c

clean:
	rm -rf ${S}/*.o $(ALL) \
	dasm-alpha-*.tar.gz \
	*.gcda *.gcno *.gcov gmon.out \
	*.o ${WEB_DIST}/${WEB_NAME}.mjs \
	*.o ${WEB_DIST}/${WEB_NAME}.js \
	*.o ${WEB_DIST}/${WEB_NAME}.html \
	*.o ${WEB_DIST}/${WEB_NAME}.mem \
	*.o ${WEB_DIST}/${WEB_NAME}.js.mem \
	*.o ${WEB_DIST}/${WEB_NAME}.data \
	*.o ${WEB_DIST}/${WEB_NAME}.wasm \
	*.o ${WEB_DIST}/${WEB_NAME}.data
