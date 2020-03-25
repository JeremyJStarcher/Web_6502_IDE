#include <SDL.h>
#include <SDL_ttf.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>

#include <emscripten.h>

#include "machine.h"



SDL_Window *window;
SDL_Renderer *renderer;
TTF_Font *font;

const int CANVAS_WIDTH = 1000;
const int CANVAS_HEIGHT = 500;
const int BYTES_PER_PIXEL = 4;

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

void mainloop()
{
    static bool flippy = true;
    SDL_Color color = {255, 255, 255};
    SDL_Surface *surface;

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

    SDL_RenderCopy(renderer, texture, NULL, &dstrect);
    SDL_RenderPresent(renderer);
    SDL_DestroyTexture(texture);
    SDL_FreeSurface(surface);
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
