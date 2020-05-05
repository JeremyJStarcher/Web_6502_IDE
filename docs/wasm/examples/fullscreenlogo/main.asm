   PROCESSOR 6502
   ORG $0600
;
;  draw image
;

start:
  lda #<logo
  sta $0
  lda #>logo
  sta $1

  lda #$00
  sta $2
  lda #$02
  sta $3

  ldx #$0
l:
  lda ($0,x)
  sta ($2,x)

  inc $00
  lda $00
  cmp #$00
  bne notReset1
  inc $01
notReset1:

  inc $02
  lda $02 
  cmp #$00
  bne notReset2
  lda $03
  cmp #$05
  beq done
  inc $03
notReset2:

  jmp l
done:
  rts

logo:
 .byte 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,1,1,1,1,1,6,6,6
 .byte 6,6,6,6,1,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,1,1,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,1
 .byte 1,1,1,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,6,6,6,6,6,6,6,6,6,6,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6
 .byte 1,1,6,6,6,6,6,6,6,6,6,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,1
 .byte 1,1,6,6,6,6,6,6,6,6,1,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,6,6,6,1,1
 .byte 1,1,6,6,6,6,6,6,6,6,1,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,6,6,1,1,1
 .byte 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,6,1,1,1,1
 .byte 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,1,1,1,1,1
 .byte 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,1,1,1,1,1,1
 .byte 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,2,2,2,2,2,1,1,1,1,1,1
 .byte 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1
 .byte 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1
 .byte 1,6,6,6,6,6,6,6,6,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,2,2,2,2,2,2,2,2,1,1,1
 .byte 1,1,6,6,6,6,6,6,6,6,1,1,1,1,1,1
 .byte 1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1
 .byte 1,1,6,6,6,6,6,6,6,6,6,1,1,1,1,1
 .byte 1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,1
 .byte 1,1,1,6,6,6,6,6,6,6,6,6,1,1,1,1
 .byte 1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2
 .byte 1,1,1,6,6,6,6,6,6,6,6,6,6,1,1,1
 .byte 1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,1,6,6,6,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,1,1,1,1,6,6,6,6
 .byte 6,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
 .byte 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
