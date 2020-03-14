#include <emscripten/emscripten.h>
#include <string.h>
#include <strings.h>
#include <stdio.h>

#ifdef __cplusplus
extern "C"
{
#endif
	extern int main(int argc, char **argv);

	void create_file_name(char *buffer, char *prefix, char *filename, char *ext)
	{
		strcpy(buffer, prefix);
		strcat(buffer, filename);
		strcat(buffer, ".");
		strcat(buffer, ext);
	}

	void EMSCRIPTEN_KEEPALIVE wasm_main(char *filename, int output_format)
	{
		/*
		const cmdargs = [
			0	`dasm`,
			1	`$ { filename }`,		// Source file
			2	`- o${filename}.bin`, // output file name (else a.out)
			3	`- l${filename}.lst`, // list file name (else none generated)
			4	`- L${filename}.lng`, // list file name, containing all passes
			5	`- s${filename}.sym`, // symbol dump file name (else none generated)
			6	`- f2`,				// output format 1-3 (default 1, see below)
		];
		*/

		char source_file[100];
		create_file_name(source_file, "", filename, "asm");

		char dest[100];
		create_file_name(dest, "-o", filename, "bin");

		char list[100];
		create_file_name(list, "-l", filename, "lst");

		char sym[100];
		create_file_name(sym, "-s", filename, "sym");

		char errorFormat[10];
		strcpy(errorFormat, "-E2");

		char format[10];
		strcpy(format, "-f0");
		format[2] = '0' + output_format;

		char *argv[] = {
			&source_file[0],
			&source_file[0],
			&dest[0],
			&list[0],
//			&lng[0],
			&sym[0],
			&format[0],
			&errorFormat[0],
			NULL};

		int argc = (int)(sizeof(argv) / sizeof(argv[0])) - 1;

		main(argc, argv);
	}

	int string_len(char *p)
	{
		return strlen(p);
	}

#ifdef __cplusplus
}
#endif
