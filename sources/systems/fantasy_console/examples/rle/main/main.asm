   PROCESSOR 6502
   ORG $0600
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
;each  .byte is one RLE block
;RLE blocks are encoded as repeat count and then byte
;a count of zero indicates end of stream
logo:
  .byte 45,1 ;for example, this says repeat 1 45 times
  .byte 7,6 ;and repeat 6 7 times
  .byte 22,1
  .byte 11,6
  .byte 19,1
  .byte 13,6
  .byte 18,1
  .byte 14,6
  .byte 17,1
  .byte 15,6
  .byte 16,1
  .byte 16,6
  .byte 15,1
  .byte 17,6
  .byte 14,1
  .byte 12,6
  .byte 4,1
  .byte 2,6
  .byte 14,1
  .byte 10,6
  .byte 8,1
  .byte 11,6
  .byte 2,1
  .byte 9,6
  .byte 10,1
  .byte 10,6
  .byte 3,1
  .byte 8,6
  .byte 11,1
  .byte 9,6
  .byte 4,1
  .byte 8,6
  .byte 11,1
  .byte 8,6
  .byte 4,1
  .byte 8,6
  .byte 12,1
  .byte 7,6
  .byte 5,1
  .byte 8,6
  .byte 12,1
  .byte 6,6
  .byte 6,1
  .byte 8,6
  .byte 12,1
  .byte 5,6
  .byte 7,1
  .byte 8,6
  .byte 12,1
  .byte 5,2
  .byte 7,1
  .byte 8,6
  .byte 12,1
  .byte 6,2
  .byte 6,1
  .byte 8,6
  .byte 12,1
  .byte 7,2
  .byte 5,1
  .byte 8,6
  .byte 12,1
  .byte 8,2
  .byte 5,1
  .byte 8,6
  .byte 11,1
  .byte 9,2
  .byte 4,1
  .byte 9,6
  .byte 10,1
  .byte 10,2
  .byte 4,1
  .byte 9,6
  .byte 9,1
  .byte 11,2
  .byte 3,1
  .byte 10,6
  .byte 7,1
  .byte 1,6
  .byte 15,1
  .byte 17,6
  .byte 15,1
  .byte 17,6
  .byte 16,1
  .byte 16,6
  .byte 17,1
  .byte 15,6
  .byte 19,1
  .byte 13,6
  .byte 20,1
  .byte 12,6
  .byte 23,1
  .byte 9,6
  .byte 43,1
  .byte 0 ;end of stream marker
