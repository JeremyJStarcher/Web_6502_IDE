; Atari 7800 sprite sample
;
; Written by Daniel Boris (dboris@home.com)
; original at http://atarihq.com/danb/files/7800sprt.s
;
; Adapted to use 7800.h, optional a78 header added, and new 
; comments added by Mike Saarna.
;
; NOTE: assembling this source will create a simple BIN file. To
; add an a78 header that most emulators will expect, assemble 
; with -DA78HEADER, or uncomment the line below...
;
;A780HEADER = 1
;
; ...and be sure to use the A78 extension for your bin.
;
; The binary won't be cryptographically signed, meaning it won't pass
; the 7800 bios boot checks. This probably won't stop the bin from
; running on most emulators. This may stop it from running on some
; flash carts. It will certainly stop it running from EPROM based carts
; To cryptographically sign binaries, you can use the tools found in
; the 7800AsmDevKit - http://7800.8bitdev.org/index.php/7800AsmDevKit

  processor 6502

  include "7800.h"

	SEG.U data


;******* Variables ********************************

	org $40

xpos	ds.b	1	      	;X Position of sprite
ypos    ds.b    1            	;Y Position of sprite
temp    ds.b    1		
dlpnt	ds.w	1
dlend	ds.b	12		;Index of end of each DL




;**********************************************************
 	
        SEG     ROM

 ifconst A78HEADER
HEADER  ORG     ROMTOP-128
        DC.B    1  ; 0   Header version     - 1 byte
        DC.B    "ATARI7800"     ; 1..16  "ATARI7800   "  - 16 bytes
        DS      7,32
        DC.B    "Dan Boris, sprite sample"; 17..48 Cart title      - 32 bytes
        DS      HEADER+49-.,0
        DC.B    $00,$00,256->ROMTOP,$00; 49..52 data length      - 4 bytes
        DC.B    $00,$00  ; 53..54 cart type      - 2 bytes
    ;    bit 0 - pokey at $4000
    ;    bit 1 - supergame bank switched
    ;    bit 2 - supergame ram at $4000
    ;    bit 3 - rom at $4000
    ;    bit 4 - bank 6 at $4000
    ;    bit 5 - supergame banked ram
    ;    bit 6 - pokey at $450
    ;    bit 7 - mirror ram at $4000
    ;    bit 8-15 - Special
    ;   0 = Normal cart
        DC.B    1  ; 55   controller 1 type  - 1 byte
        DC.B    1  ; 56   controller 2 type  - 1 byte
    ;    0 = None
    ;    1 = Joystick
    ;    2 = Light Gun
        DC.B    0  ; 57 0 = NTSC 1 = PAL
        DC.B    0  ; 58   Save data peripheral - 1 byte (version 2)
    ;    0 = None / unknown (default)
    ;    1 = High Score Cart (HSC)
    ;    2 = SaveKey
        ORG     HEADER+63
        DC.B    0  ; 63   Expansion module
    ;    0 = No expansion module (default on all currently released games)
    ;    1 = Expansion module required
        ORG     HEADER+100      ; 100..127 "ACTUAL CART DATA STARTS HERE" - 28 bytes
        DC.B    "ACTUAL CART DATA STARTS HERE"
 endif

ROMTOP  ORG     $8000       ;Start of code
        
START
	sei                     ;Disable interrupts
	cld                     ;Clear decimal mode
	

;******** Atari recommended startup procedure

	lda     #$07
	sta     INPTCTRL        ;Lock into 7800 mode
	lda     #$7F
	sta     CTRL            ;Disable DMA
	lda     #$00            
	sta     OFFSET
	sta     INPTCTRL
	ldx     #$FF            ;Reset stack pointer
	txs
	
;************** Clear zero page and hardware ******

	ldx     #$40
	lda     #$00
crloop1    
	sta     $00,x           ;Clear zero page
	sta	$100,x		;Clear page 1
	inx
	bne     crloop1

;************* Clear RAM **************************

    ldy     #$00            ;Clear Ram
    lda     #$18            ;Start at $1800
    sta     $81             
    lda     #$00
    sta     $80
crloop3
    lda     #$00
    sta     ($80),y         ;Store data
    iny                     ;Next byte
    bne     crloop3         ;Branch if not done page
    inc     $81             ;Next page
    lda     $81
    cmp     #$20            ;End at $1FFF
    bne     crloop3         ;Branch if not

    ldy     #$00            ;Clear Ram
    lda     #$22            ;Start at $2200
    sta     $81             
    lda     #$00
    sta     $80
crloop4
    lda     #$00
    sta     ($80),y         ;Store data
    iny                     ;Next byte
    bne     crloop4         ;Branch if not done page
    inc     $81             ;Next page
    lda     $81
    cmp     #$27            ;End at $27FF
    bne     crloop4         ;Branch if not

    ldx     #$00
    lda     #$00
crloop5                         ;Clear 2100-213F
    sta     $2100,x
    inx
    cpx     #$40
    bne     crloop5
        
;************* Build DLL *******************

; 20 blank lines

    ldx	#$00                   
    lda     #$4F            ;16 lines
    sta     $1800,x  	      
    inx
    lda     #$21		;$2100 = blank DL
    sta	$1800,x
    inx
    lda     #$00
    sta	$1800,x
    inx                   
	lda     #$44            ;4 lines
	sta     $1800,x        
	inx
	lda     #$21
	sta	$1800,x
	inx
	lda     #$00
	sta	$1800,x
    	inx
        
; 192 mode lines divided into 12 regions

    ldy     #$00
DLLloop2                         
    lda     #$4F            ;16 lines
    sta     $1800,x        
    inx
    lda     DLPOINTH,y
    sta	$1800,x
    inx
    lda     DLPOINTL,y
    sta	$1800,x
    inx
    iny
    cpy     #$0D            ;12 DLL entries
    bne     DLLloop2


; 26 blank lines
                 
    lda     #$4F            ;16 lines
    sta     $1800,x  	      
    inx
    lda     #$21		;$2100 = blank DL
    sta	$1800,x
    inx
    lda     #$00
    sta	$1800,x
    inx                   
	lda     #$4A            ;10 lines
	sta     $1800,x        
	inx
	lda     #$21
	sta	$1800,x
	inx
	lda     #$00
	sta	$1800,x

    	
;***************** Setup Maria Registers ****************
	
        lda     #$18            ;DLL at $1800
	sta	DPPH
	lda	#$00
	sta	DPPL
	lda	#$18		;Setup Palette 0
	sta	P0C1
	lda	#$38
	sta	P0C2
	lda	#$58
	sta	P0C3
	lda	#$43		;Enable DMA
	sta	CTRL
	lda	#$00		;Setup ports to read mode
	sta	CTLSWA
	sta	CTLSWB
	
	lda	#$40		;Set initial X position of sprite
	sta	xpos
        
mainloop
	lda	MSTAT		;Wait for VBLANK
	and	#$80
	beq 	mainloop
	
	lda	SWCHA		;Read stick
	and	#$80		;Pushed Right?
	bne	skip1
	ldx	xpos		;Move sprite to right
	inx
	stx	xpos
skip1
	lda	SWCHA		;Read stick
	and 	#$40		;Pushed Left?
	bne 	skip2
	ldx 	xpos		;Move sprite to left
	dex
	stx 	xpos
skip2
    lda     SWCHA		;Read stick
    and     #$20		;Pushed Down?
    bne     skip3		
    ldx     ypos		;Move sprite down
    cpx	#176	
    beq	skip3		;Don't move if we are at the bottom
    inx
    stx     ypos	
skip3
    lda     SWCHA		;Read stick
    and     #$10		;Pushed Up?
    bne     skip4		
    ldx     ypos		;Move sprite up
    beq	skip4		;Don't move if we are at the top
    dex			
    stx     ypos
skip4

;********************** reset DL ends ******************
	
	ldx 	#$0C
	lda	#$00
dlclearloop
	dex
	sta	dlend,x
	bne	dlclearloop
	
	
;******************** build DL entries *********************

        lda     ypos		;Get Y position
   	and	#$F0		
   	lsr 			;Divide by 16
   	lsr	
   	lsr	
   	lsr	
   	tax
   	lda	DLPOINTL,x	;Get pointer to DL that this sprite starts in
   	sta	dlpnt
   	lda	DLPOINTH,x
   	sta	dlpnt+1
   	
   	;Create DL entry for upper part of sprite
   	
   	ldy	dlend,x		;Get the index to the end of this DL
   	lda	#$00				
	sta     (dlpnt),y	;Low byte of data address
	iny
	lda	#$40		;Mode 320x1
	sta     (dlpnt),y
	iny 
	lda	ypos		
	and	#$0F		
	ora	#$a0
	sta     (dlpnt),y
	iny
	lda	#$1F		;Palette 0, 1 byte wide
	sta     (dlpnt),y
	iny
	lda	xpos		;Horizontal position
    sta     (dlpnt),y
    sty	dlend,x
        
    lda	ypos
    and	#$0F		;See if sprite is entirely within this region
    beq	doneDL		;branch if it is
        
    ;Create DL entry for lower part of sprite 
        
    inx			;Next region
    lda	DLPOINTL,x	;Get pointer to next DL
   	sta	dlpnt
   	lda	DLPOINTH,x
   	sta	dlpnt+1
        ldy	dlend,x		;Get the index to the end of this DL
	lda	#$00				
	sta     (dlpnt),y
	iny
	lda	#$40		;Mode 320x1
	sta     (dlpnt),y
	iny 
	lda	ypos
	and	#$0F
	eor	#$0F
	sta	temp
	lda	#$a0
	clc
	sbc 	temp
	sta     (dlpnt),y
	iny
	lda	#$1F		;Palette 0, 1 byte wide
	sta     (dlpnt),y
	iny
	lda	xpos		;Horizontal position
	sta     (dlpnt),y
	sty	dlend,x
doneDL

;************** add DL end entry on each DL *****************************

	ldx	#$0C
dlendloop
	dex
	lda	DLPOINTL,x
	sta	dlpnt
	lda	DLPOINTH,x
   	sta	dlpnt+1
   	ldy 	dlend,x
   	iny
   	lda	#$00
   	sta	(dlpnt),y
   	txa
	bne 	dlendloop   	
   	
vbloop
	lda	MSTAT		;Wait for VBLANK to end
	and	#$80
	bne 	vbloop
	
	jmp     mainloop	;Loop

redraw
      

NMI
	RTI
	
IRQ
	RTI
	

;Pointers to the DLs

DLPOINTH
    .byte   $22,$22,$22,$22,$23,$23,$23,$23,$24,$24,$24,$24
DLPOINTL
    .byte   $00,$40,$80,$C0,$00,$40,$80,$C0,$00,$40,$80,$C0




;************** Graphic Data *****************************
    org $a000
    .byte     %00111100
    org $a100
    .byte     %00111100
    org $a200
    .byte     %01000010 
    org $a300
    .byte     %01000010 
    org $a400
    .byte     %10011001
    org $a500
    .byte     %10011001
    org $a600
    .byte     %10100101
    org $a700
    .byte     %10100101
    org $a800
    .byte     %10000001
    org $a900
    .byte     %10000001
    org $aA00
    .byte     %10100101
    org $aB00
    .byte     %10100101
    org $aC00
    .byte     %01000010
    org $aD00
    .byte     %01000010
    org $aE00
    .byte     %00111100
    org $aF00
    .byte     %00111100


;************** Cart reset vector **************************

	 org     $fff8
	.byte   $FF         ;Region verification
	.byte   $87         ;ROM start $4000
	.word   #NMI
	.word   #START
	.word   #IRQ
