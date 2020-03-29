#include <string.h>
#include <strings.h>
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <time.h>

#include "machine.h"

static uint8_t ram[64 * 1024];
static uint16_t lastAddress;
static uint8_t lastValue;
static uint8_t lastMode;

#define SYSMAGICADDRESS (0xFFF0)

uint8_t read6502(uint16_t address)
{
	return ram[address];
}

void write6502(uint16_t address, uint8_t value)
{
	ram[address] = value;
	lastAddress = address;
	lastValue = value;
	lastMode = 1;
}

void testrun()
{
	reset6502();

	for (int i = 0; i < 100; i++)
	{
		step6502();
	}
}

void js_step6502(uint16_t *buf, int len)
{
	uint32_t oldticks = clockticks6502;

	step6502();

	uint16_t ticks = clockticks6502 - oldticks;

	if (len >= 14)
	{
		buf[0] = pc;
		buf[1] = sp;
		buf[2] = a;
		buf[3] = x;
		buf[4] = y;
		buf[5] = status;
		buf[6] = read6502(pc);
		buf[7] = read6502(pc + 1);
		buf[8] = read6502(pc + 2);
		buf[9] = read6502(SYSMAGICADDRESS);
		buf[10] = lastAddress;
		buf[11] = lastValue;
		buf[12] = lastMode;
		buf[13] = ticks;

		lastMode = 0;
	}
}

void bin_to_ram(unsigned char *stream, int bufz)
{
	// The stream format we choose for this project has the following format:
	// Chunk format, may be repeated multiple times
	// Address:  <LSB> <MSB>
	// Length:   <LSB <MSB>
	// Data:     <BYTE>....

	int i = 0;
	while (i < bufz)
	{
		unsigned int address = (stream[i + 1] * 256) + stream[i];
		i += 2;
		unsigned int len = (stream[i + 1] * 256) + stream[i];
		i += 2;

		for (int j = 0; j < len; j++)
		{
			unsigned int offset = address + j;
			unsigned int b = stream[i];

			write6502(offset, b);
			i += 1;
		}
	}
}

void load_rom(char *filename) {
	FILE *f = fopen(filename, "rb");
	if (f == NULL)
	{
		fprintf(stderr,"Could not open file: %s\n", filename);
		return;
	}

	unsigned char *buffer;

	fseek(f, 0, SEEK_END);
	int fileLen = ftell(f);

	fseek(f, 0, SEEK_SET);

	// Allocate memory
	buffer = (unsigned char *)malloc(fileLen + 1);
	if (!buffer)
	{
		fprintf(stderr, "Memory error!");
		fclose(f);
		return;
	}

	//Read file contents into buffer
	int sizeRead = fread(buffer, fileLen, 1, f);
	fclose(f);

	bin_to_ram(buffer, fileLen);
	free(buffer);
}

void boot_machine()
{
	// for (uint16_t i = 0; i <= 0xFFFF; i++)
	// {
	//    write6502(i, 0);
	// }

	reset6502();
	load_rom("/bios.rom");
	load_rom("/file.rom");
}