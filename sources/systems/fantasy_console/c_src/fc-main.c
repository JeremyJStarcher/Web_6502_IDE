#include <SDL.h>
#include <SDL_ttf.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include <math.h>

#include <emscripten.h>

#include "machine.h"

bool cpu_halted = false;

SDL_Window *window;
SDL_Renderer *renderer;
TTF_Font *font;

const int PIXEL_WIDTH = 16;
const int PIXEL_HEIGHT = 16;
const int GRAPHICS_HEIGHT = 32;
const int GRAPHICS_WIDTH = 32;

const int CANVAS_WIDTH = PIXEL_WIDTH * GRAPHICS_WIDTH;
const int CANVAS_HEIGHT = PIXEL_HEIGHT * GRAPHICS_HEIGHT;
const int BYTES_PER_PIXEL = 4;

//6502 CPU registers
extern uint16_t pc;
extern uint8_t sp, a, x, y, status;

const uint8_t OP_BRK = 0x00;
const uint8_t OP_RTS = 0x60;

const uint16_t BASE_STACK = 0x0100;

uint8_t palette[16][3] = {
    {0x00, 0x00, 0x00},
    {0xff, 0xff, 0xff},
    {0x88, 0x00, 0x00},
    {0xaa, 0xff, 0xee},
    {0xcc, 0x44, 0xcc},
    {0x00, 0xcc, 0x55},
    {0x00, 0x00, 0xaa},
    {0xee, 0xee, 0x77},
    {0xdd, 0x88, 0x55},
    {0x66, 0x44, 0x00},
    {0xff, 0x77, 0x77},
    {0x33, 0x33, 0x33},
    {0x77, 0x77, 0x77},
    {0xaa, 0xff, 0x66},
    {0x00, 0x88, 0xff},
    {0xbb, 0xbb, 0xbb},
};

void drawLines()
{
    static int r = 255, g = 0, b = 0;
    r += 10;
    g += 27;
    b += 1;

    r = r % 255;
    g = g % 255;
    b = b % 255;

    SDL_Surface *surface = SDL_CreateRGBSurface(0, CANVAS_WIDTH, CANVAS_HEIGHT, 32, 0, 0, 0, 0);
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, SDL_ALPHA_OPAQUE);
    SDL_RenderClear(renderer);

    SDL_SetRenderDrawColor(renderer, r, g, b, SDL_ALPHA_OPAQUE);
    SDL_RenderDrawLine(renderer, 320, 200, 300, 240);
    SDL_RenderDrawLine(renderer, 300, 240, 340, 240);
    SDL_RenderDrawLine(renderer, 340, 240, 320, 200);
    SDL_RenderPresent(renderer);
    SDL_FreeSurface(surface);
}

void drawRandomPixels()
{
    SDL_Surface *surface = SDL_CreateRGBSurface(0, CANVAS_WIDTH, CANVAS_HEIGHT, 32, 0, 0, 0, 0);
    if (SDL_MUSTLOCK(surface))
        SDL_LockSurface(surface);

    Uint8 *pixels = surface->pixels;

    for (int i = 0; i < CANVAS_WIDTH * CANVAS_HEIGHT * BYTES_PER_PIXEL; i++)
    {
        char randomByte = rand() % 255;
        pixels[i] = randomByte;
    }

    if (SDL_MUSTLOCK(surface))
        SDL_UnlockSurface(surface);

    SDL_Texture *screenTexture = SDL_CreateTextureFromSurface(renderer, surface);

    SDL_RenderClear(renderer);
    SDL_RenderCopy(renderer, screenTexture, NULL, NULL);
    SDL_RenderPresent(renderer);

    SDL_DestroyTexture(screenTexture);
    SDL_FreeSurface(surface);
}

uint16_t readword(uint16_t address)
{
    return (uint16_t)read6502(address) | ((uint16_t)read6502(address + 1) << 8);
}

void mainloop()
{

    if (cpu_halted)
    {
        return;
    }

    static bool flippy = true;
    SDL_Color color = {255, 255, 255};
    SDL_Surface *surface;

    for (int i = 0; i < 200; i++)
    {
        // If the stack is empty, then there is nowhere
        // to return to.   On a "real" system it would return
        // to a monitor or something.  We set a break flag and
        // quit executing.

        uint8_t opcode = read6502(pc);

        if (opcode == OP_RTS && sp == 0xFF)
        {
            printf("System halted at: $%04X\n", pc);
            cpu_halted = true;
            break;
        }

        if (opcode == OP_BRK)
        {
            uint16_t vsize = readword(0xA2);
            uint16_t vto = readword(0xa4);
            printf("size : %04X\n", vsize);
            printf("to: %04X\n", vto);
            printf("sp: %02X\n", sp);
            printf("pc: %04X\n", pc);
        }

        step6502();
    }

#if 0
    if (flippy)
    {
        surface = TTF_RenderText_Solid(font, "The land of the McDonald.", color);
    }
    else
    {
        surface = TTF_RenderText_Solid(font, "##############################################", color);
    }
    flippy = !flippy;

    SDL_Texture *texture = SDL_CreateTextureFromSurface(renderer, surface);

    int texW = 0;
    int texH = 0;
    SDL_QueryTexture(texture, NULL, NULL, &texW, &texH);
    SDL_Rect dstrect = {0, 0, texW, texH};
#endif

    // Copy the screen RAM over
    for (uint16_t dd = 0x0200; dd <= 0x5FF; dd++)
    {
        uint8_t value = read6502(dd);
        uint16_t address = dd - 0x0200;

        int x = floor(address % GRAPHICS_WIDTH);
        int y = floor(address / GRAPHICS_WIDTH);

        int r1 = palette[value & 0x0F][0];
        int g1 = palette[value & 0x0F][1];
        int b1 = palette[value & 0x0F][2];

        SDL_SetRenderDrawColor(renderer, r1, g1, b1, SDL_ALPHA_OPAQUE);

        SDL_Rect rect;
        rect.x = x * PIXEL_WIDTH;
        rect.y = y * PIXEL_WIDTH;
        rect.w = PIXEL_WIDTH;
        rect.h = PIXEL_WIDTH;

        SDL_RenderFillRect(renderer, &rect);
    }

    // SDL_RenderCopy(renderer, texture, NULL, &dstrect);
    SDL_RenderPresent(renderer);
    // SDL_DestroyTexture(texture);
    // SDL_FreeSurface(surface);
}

int init_system()
{
    if (SDL_Init(SDL_INIT_VIDEO) < 0)
    {
        printf("SDL could not initialize! SDL_Error: %s\n", SDL_GetError());
        return 1;
    }

    if (TTF_Init() < 0)
    {
        printf("SDL_TTF could not initialize! SDL_Error: %s\n", SDL_GetError());
        return 1;
    }

    window = SDL_CreateWindow("SDL_ttf in SDL2",
                              SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED,
                              CANVAS_WIDTH, CANVAS_HEIGHT,
                              0);
    renderer = SDL_CreateRenderer(window, -1, 0);
    font = TTF_OpenFont("PixelOperatorMono.ttf", 45);

    if (window == NULL)
    {
        printf("Window could not be created! SDL_Error: %s\n", SDL_GetError());
        return 1;
    }

    if (renderer == NULL)
    {
        printf("Renderer could not be created! SDL_Error: %s\n", SDL_GetError());
        return 1;
    }

    if (font == NULL)
    {
        printf("Font could not be created! SDL_Error: %s\n", SDL_GetError());
        return 1;
    }

    boot_machine();
    reset6502();

    return 0;
}

int main(int argc, char **argv)
{
    init_system();

    emscripten_set_main_loop(mainloop, 0, 1);

    //   SDL_FreeSurface(surface);
    //   TTF_CloseFont(font);
    //   SDL_DestroyRenderer(renderer);
    //   SDL_DestroyWindow(window);
    //   TTF_Quit();
    //   SDL_Quit();

    return 0;
}
