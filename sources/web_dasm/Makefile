#
# the DASM macro assembler (aka small systems cross assembler)
#
# Copyright (c) 1988-2002 by Matthew Dillon.
# Copyright (c) 1995 by Olaf "Rhialto" Seibert.
# Copyright (c) 2003-2008 by Andrew Davie.
# Copyright (c) 2008 by Peter H. Froehlich.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

# Executables will be generated in the trunk/src/ directory (the
# "current directory" as far as this Makefile is concerned). If
# you want to move them somewhere, trunk/bin/ say, do so in the
# trunk/ Makefile!


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
WEB_NAME=dasm-exe
S=../dasm/src

# Set the correct compiler based upon the target
wasm: CC=emcc -Os
wasm: WASM_MODE=1
asmjs: CC=emcc -Os
asmjs: WASM_MODE=0

OBJS= ${S}/main.o ${S}/ops.o ${S}/globals.o ${S}/exp.o ${S}/symbols.o \
      ${S}/mne6303.o ${S}/mne6502.o ${S}/mne68705.o ${S}/mne6811.o ${S}/mnef8.o
SRCS= ${S}/main.c ${S}/ops.c ${S}/globals.c${S}/ exp.c ${S}/symbols.c \
      ${S}/mne6303.c ${S}/mne6502.c ${S}/mne68705.c ${S}/mne6811.c ${S}/mnef8.c

EMCC_OBJS= ${OBJS} wasm_main.o
EMCC_SRCS = ${OBJS} wasm_main.c

ALL=dasm 

all: $(ALL)

dasm: $(OBJS)
	$(CC) $(OBJS) -o dasm $(LDFLAGS)


EM_CFLAGS= \
	-s WASM=$(WASM_MODE)  \
	-s INVOKE_RUN=0 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS="['_main', '_wasm_main']" \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']" \
	--bind \
	--preload-file ../../sources/web/asm@/asm \

wasm: $(EMCC_OBJS)
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.js \
	${EM_CFLAGS} \
	$(LDFLAGS)

asmjs: $(EMCC_OBJS)
	$(CC) $(EMCC_OBJS) -o ${WEB_DIST}/${WEB_NAME}.js \
	${EM_CFLAGS} \
	$(LDFLAGS)

obj: $(OBJS)

$(OBJS): ${S}/asm.h

clean:
	rm -rf ${S}/*.o $(ALL) \
	*.o \
	${WEB_DIST}/${WEB_NAME}.mjs \
	${WEB_DIST}/${WEB_NAME}.js \
	${WEB_DIST}/${WEB_NAME}.js.mem \
	${WEB_DIST}/${WEB_NAME}.data \
	${WEB_DIST}/${WEB_NAME}.wasm \
	${WEB_DIST}/${WEB_NAME}.data
