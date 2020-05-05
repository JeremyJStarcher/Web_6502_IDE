   PROCESSOR 6502
   ORG $0600

; This code is non-functional in the original emulator
; it doesn't like the 
;  eor ($0,x)
; line
; So I can't tell what it does or if this one does the same.

; Sierpinski
; Submitted by Anonymous

start:
  lda #$e1
  sta $0
  lda #$01
  sta $1
  ldy #$20

write:
  ldx #$00
  eor ($0,x)
  sta ($0),y

  inc $0
  bne write
  inc $1
  ldx $1
  cpx #$06
  bne write

  rts
