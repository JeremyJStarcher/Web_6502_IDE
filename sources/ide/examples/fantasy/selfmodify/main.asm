   PROCESSOR 6502
   ORG $0600
; A very simple example of
; self-modifying code
; and code entry points

  lda $fe
  sta $1001
  jmp $1000

   ORG $1000
  lda #$00
  sta $3ef
  jmp $600
  