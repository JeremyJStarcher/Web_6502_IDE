   PROCESSOR 6502
   ORG $0600
; software sprites
; by PJP

loop:
 ldx $90
 inx
 stx $90

 lda #4          ; *** NUMBER OF SPRITES
 sta $3
 lda #0
 sta $4

multiple:
 lda $90
 clc
 adc $4
 tax

 lda sinus,x
 ldy cosinus,x
 asl
 tax
 lda ypos,x
 sta $00
 inx
 lda ypos,x
 sta $01
 ldx #0
 lda #5    ; **** HEIGHT OF EACH SPRITE
 sta $2
draw:
 lda image,x
 sta ($0),y
 inx
 iny
 lda image,x
 sta ($0),y
 inx
 iny
 lda image,x
 sta ($0),y
 inx
 iny
 lda image,x
 sta ($0),y
 inx
 iny
 lda image,x
 sta ($0),y


 tya
 clc
 adc #28
 tay
 inx
 dec $2
 bne draw

 lda $4 
 clc
 adc #18        ; *** DISTANCE BETWEEN SPRITES (FROM TABLE)
 sta $4

 dec $3
 bne multiple

 jmp loop

; SINUS (AND COSINUS) 

sinus:
 .byte $0e, $0e, $0e, $0f, $0f, $0f, $10, $10, $10, $11
 .byte $11, $11, $12, $12, $12, $13, $13, $13, $14, $14
 .byte $14, $14, $15, $15, $15, $16, $16, $16, $16, $17
 .byte $17, $17, $17, $18, $18, $18, $18, $19, $19, $19
 .byte $19, $19, $1a, $1a, $1a, $1a, $1a, $1a, $1a, $1b
 .byte $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b
 .byte $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b
cosinus:
 .byte $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b
 .byte $1a, $1a, $1a, $1a, $1a, $1a, $19, $19, $19, $19
 .byte $19, $18, $18, $18, $18, $18, $17, $17, $17, $17
 .byte $16, $16, $16, $15, $15, $15, $15, $14, $14, $14
 .byte $13, $13, $13, $12, $12, $12, $11, $11, $11, $10
 .byte $10, $10, $0f, $0f, $0f, $0e, $0e, $0e, $0d, $0d
 .byte $0d, $0c, $0c, $0c, $0b, $0b, $0b, $0a, $0a, $0a
 .byte $09, $09, $09, $08, $08, $08, $07, $07, $07, $06
 .byte $06, $06, $06, $05, $05, $05, $04, $04, $04, $04
 .byte $03, $03, $03, $03, $03, $02, $02, $02, $02, $02
 .byte $01, $01, $01, $01, $01, $01, $00, $00, $00, $00
 .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
 .byte $00, $00, $00, $00, $00, $00, $00, $00, $00, $00
 .byte $00, $00, $00, $00, $00, $00, $00, $01, $01, $01
 .byte $01, $01, $01, $01, $02, $02, $02, $02, $02, $03
 .byte $03, $03, $03, $04, $04, $04, $04, $05, $05, $05
 .byte $05, $06, $06, $06, $07, $07, $07, $07, $08, $08
 .byte $08, $09, $09, $09, $0a, $0a, $0a, $0b, $0b, $0b
 .byte $0c, $0c, $0c, $0d, $0d

 .byte $0e, $0e, $0e, $0f, $0f, $0f, $10, $10, $10, $11
 .byte $11, $11, $12, $12, $12, $13, $13, $13, $14, $14
 .byte $14, $14, $15, $15, $15, $16, $16, $16, $16, $17
 .byte $17, $17, $17, $18, $18, $18, $18, $19, $19, $19
 .byte $19, $19, $1a, $1a, $1a, $1a, $1a, $1a, $1a, $1b
 .byte $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b
 .byte $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b
 .byte $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b, $1b
 .byte $1a, $1a, $1a, $1a, $1a, $1a, $19, $19, $19, $19

; 5x5 BYTES

image:
 .byte $0,$0,$0,$0,$0
 .byte $0,$c,$c,$c,$0
 .byte $0,$c,$1,$c,$0
 .byte $0,$c,$c,$c,$0
 .byte $0,$0,$0,$0,$0

; YPOS LOOKUP TABLE

ypos:
 .byte $00,$02,$20,$02,$40,$02,$60,$02
 .byte $80,$02,$a0,$02,$c0,$02,$e0,$02
 .byte $00,$03,$20,$03,$40,$03,$60,$03
 .byte $80,$03,$a0,$03,$c0,$03,$e0,$03
 .byte $00,$04,$20,$04,$40,$04,$60,$04
 .byte $80,$04,$a0,$04,$c0,$04,$e0,$04
 .byte $00,$05,$20,$05,$40,$05,$60,$05
 .byte $80,$05,$a0,$05,$c0,$05,$e0,$05

