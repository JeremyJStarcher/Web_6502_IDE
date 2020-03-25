#include <string.h>
#include <strings.h>
#include <stdio.h>
#include <stdint.h>

//6502 CPU registers
extern uint16_t pc;
extern uint8_t sp, a, x, y, status;
extern void reset6502(void);
extern uint32_t clockticks6502;

extern void step6502(void);

void js_step6502(uint16_t *buf, int len);
uint8_t read6502(uint16_t address);
void write6502(uint16_t address, uint8_t value);
void testrun();
void boot_machine();
void bin_to_ram(unsigned char *stream, int bufz);
