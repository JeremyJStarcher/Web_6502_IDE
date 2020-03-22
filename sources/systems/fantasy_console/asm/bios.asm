   PROCESSOR 6502

; ====================================
; == ZERO PAGE ADDRESSING
; ====================================
; Magic value used by System Monitor
SYSMAGICADDRESS EQU $FFF0

;=====================================
;== USER SPACE STARTS HERE
;=====================================
   ORG $0600
   rts

;=====================================
;  The start of BIOS routines/ROM
;=====================================

   ORG $F000

; Reset routine, called as part of the; boot process.
; Cleanup routine from macro.h; (by Andrew Davie/DASM)

RESET: subroutine
; This magic value means we are NOT in
; BRK mode.  Used by the UI screen.
   LDA #$00
   STA SYSMAGICADDRESS

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

   jsr  $0600  ; Start userland routines.
   brk

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

_KSYSCALL:
   RTS

_KBRK:
   ; Set a magic flag to show we are in BRK mode
   PHA
   LDA #$FF
   STA SYSMAGICADDRESS
   PLA
   RTI

_KNMI:
   ; Set a magic flag to show we are in NMI mode
   PHA
   LDA #$FE
   STA SYSMAGICADDRESS
   PLA
   RTI

;===============================================================================
; Define End of Cartridge
;===============================================================================
   ORG $FFFA        ; set address to 6507 Interrupt Vectors

   .WORD _KNMI
   .WORD RESET
   .WORD _KBRK
