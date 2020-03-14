;RLE compressed full screen logo
;by Thomas

;set up our pointers
lda #<logo ;for the logo
sta $0
lda #>logo
sta $1

lda #0 ;and to the screen area
sta $2
lda #2
sta $3

loop: ;main loop
lda ($0),y ;load the repeat count
cmp #0 ;if it is zero
beq done ;we\'re done
tax ;put the repeat count in x
iny
lda ($0),y ;now load the byte
iny

rleloop:
jsr draw ;go draw our current pixel using the color in a
dex
cpx #0 ;if x is zero
beq loop ;we are done with this rle block
jmp rleloop ;otherwise, output another pixel

draw:
sty $4 ;store the current y and load the other y for this routine
ldy $5
sta ($2),y ;actually plot the pixel
iny ;get ready for the next pixel
cpy #00 ;if y has wrapped around
beq next ;increment the address and reset y
sty $5 ;save y and load the old one
ldy $4
rts

next:
ldy #0 ;reset y
inc $03 ;but increment the screen pointer
sty $5 ;save y and load the old one
ldy $4
rts

done:
rts ;tries to return, causes a stack empty error and halts the program

;RLE logo data
;each dcb is one RLE block
;RLE blocks are encoded as repeat count and then byte
;a count of zero indicates end of stream
logo:
dcb 45,1 ;for example, this says repeat 1 45 times
dcb 7,6 ;and repeat 6 7 times
dcb 22,1
dcb 11,6
dcb 19,1
dcb 13,6
dcb 18,1
dcb 14,6
dcb 17,1
dcb 15,6
dcb 16,1
dcb 16,6
dcb 15,1
dcb 17,6
dcb 14,1
dcb 12,6
dcb 4,1
dcb 2,6
dcb 14,1
dcb 10,6
dcb 8,1
dcb 11,6
dcb 2,1
dcb 9,6
dcb 10,1
dcb 10,6
dcb 3,1
dcb 8,6
dcb 11,1
dcb 9,6
dcb 4,1
dcb 8,6
dcb 11,1
dcb 8,6
dcb 4,1
dcb 8,6
dcb 12,1
dcb 7,6
dcb 5,1
dcb 8,6
dcb 12,1
dcb 6,6
dcb 6,1
dcb 8,6
dcb 12,1
dcb 5,6
dcb 7,1
dcb 8,6
dcb 12,1
dcb 5,2
dcb 7,1
dcb 8,6
dcb 12,1
dcb 6,2
dcb 6,1
dcb 8,6
dcb 12,1
dcb 7,2
dcb 5,1
dcb 8,6
dcb 12,1
dcb 8,2
dcb 5,1
dcb 8,6
dcb 11,1
dcb 9,2
dcb 4,1
dcb 9,6
dcb 10,1
dcb 10,2
dcb 4,1
dcb 9,6
dcb 9,1
dcb 11,2
dcb 3,1
dcb 10,6
dcb 7,1
dcb 1,6
dcb 15,1
dcb 17,6
dcb 15,1
dcb 17,6
dcb 16,1
dcb 16,6
dcb 17,1
dcb 15,6
dcb 19,1
dcb 13,6
dcb 20,1
dcb 12,6
dcb 23,1
dcb 9,6
dcb 43,1
dcb 0 ;end of stream marker
