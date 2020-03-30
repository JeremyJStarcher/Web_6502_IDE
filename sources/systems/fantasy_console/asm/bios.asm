   PROCESSOR 6502

; ====================================
; == ZERO PAGE ADDRESSING
; ====================================
   org $00A0

MBUF_FROM:  .word $0200
MBUF_SIZEL: .byte $00
MBUF_SIZEH: .byte $04
MBUF_TO:    .word $0200

;=====================================
;== USER SPACE STARTS HERE
;=====================================
   ORG $0600
   nop
   nop
   rts

;=====================================
;  The start of BIOS routines/ROM
;=====================================

   ORG $F000
;=====================================
; Clear a block of RAM
;
; MBUF_TO = destination start address
; MBUF_SIZEH = number of bytes to clear
; MBUF_SIZEL
; MBUF_FROM (low) = Byte to fill
;
; Destroys all registers
; Destroys TO and SIZE

CLEAR_BLOCK: subroutine
         LDY #0            ; Start off at offset #0
         LDX MBUF_SIZEH    ; The outer loop
         BEQ .MD2
.MD1     LDA MBUF_FROM 
         STA (MBUF_TO),Y
         INY
         BNE .MD1
         INC MBUF_TO+1
         DEX
         BNE .MD1
.MD2     LDX MBUF_SIZEL
         BEQ .MD4
.MD3     LDA MBUF_FROM ; move the remaining bytes
         STA (MBUF_TO),Y
         INY
         DEX
         BNE .MD3
.MD4     RTS

;-================================================================
; Reset routine, called as part of the; boot process.
; Cleanup routine from macro.h; (by Andrew Davie/DASM)

RESET: subroutine
; Twiddle the bit to watch it change
; onscreen.  Watch the flags to see
; them go on and off
   CLD      ; CLEAR DECIMAL (D)
   SED      ; SET DECIMAL (D)
   CLD      ; SET DECIMAL (D)
   SED      ; CLEAR DECIMAL (D)

   sei      ; Allow interrupts
   cld      ; clear decimal flag
   ldx #0   ; Start counting at0
   txa      ; Copy to X
   tay      ; Copy to Y
.CleanStack:
   dex      ; DEC X. Wrap around to 255 on the first pass.
   txs      ; Set the stack pointer
   pha      ; And push a 0 there
   bne .CleanStack

   ldx #$FF
   txs

   LDA #$00
   STA MBUF_TO;
   LDA #$02
   STA MBUF_TO+1

   lda #$04
   sta MBUF_SIZEH
   lda #$00
   sta MBUF_SIZEL

   lda #$03          ; Fill color
   sta MBUF_FROM

   jsr CLEAR_BLOCK

   lda #0;
   ldy #0;
   ldx #0;

   jmp  $0600  ; Start userland routines.

;===============================================================================
; free space check before End of Cartridge
;===============================================================================
 if (* & $FF)
    echo "------", [$FFF0 - *]d, "bytes free before end of ROM"
    ; align 256
 endif

 ; A magic area for system calls
 ; $A $FF EXIT
   ORG $FFF0
   .byte 00

_KBRK:
   RTI

_KNMI:
   ; Set a magic flag to show we are in NMI mode
   RTI

;===============================================================================
; Define End of Cartridge
;===============================================================================
   ORG $FFFA        ; set address to 6507 Interrupt Vectors

   .WORD _KNMI
   .WORD RESET
   .WORD _KBRK
