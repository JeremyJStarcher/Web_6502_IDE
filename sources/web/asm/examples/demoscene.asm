   PROCESSOR 6502
   ORG $0600

start:
  ldx #0
c:
  lda bottombar,x
  cmp #$ff
  beq init
  sta $4e0,x
  sta $5e0,x
  inx
  jmp c
init:
  jsr initDraw
  lda #0
  sta $10 ; scrptr
  sta $11 ; txtptr
loop:
  jsr drawMain
  jsr putfont
  jsr scrollarea
  jmp loop

scrollarea:
  ldx #0
g:
  lda $521,x
  sta $520,x
  lda $541,x
  sta $540,x
  lda $561,x
  sta $560,x
  lda $581,x
  sta $580,x
  lda $5a1,x
  sta $5a0,x
  inx
  cpx #31
  bne g
  rts

putfont:
  lda $10 ; scrptr
  cmp #0
  bne noNext
  inc $11
  ldx $11
  lda scrolltext,x
  tax
  lda fontSize,x
  sta $10
noNext:
  dec $10
  ldx $11
  lda scrolltext,x
  cmp #$ff
  bne notResetText
  lda #0
  sta $10
  sta $11
  rts

notResetText:
  asl
  tax
  lda fontlookup,x
  sta $2
  inx
  lda fontlookup,x
  sta $3
  lda #<fonts
  clc
  adc $2
  sta $0
  lda #>fonts
  adc $3
  sta $1
  ldy $10
  lda ($00),y
  sta $53f
  tya
  clc
  adc #6
  tay
  lda ($00),y
  sta $55f
  tya
  clc
  adc #6
  tay
  lda ($00),y
  sta $57f
  tya
  clc
  adc #6
  tay
  lda ($00),y
  sta $59f
  tya
  clc
  adc #6
  tay
  lda ($00),y
  sta $5bf
  rts

initDraw:
  lda #<picture
  sta $20
  lda #>picture
  sta $21
  lda #$00
  sta $22
  lda #$02
  sta $23
  ldx #$0
  rts
drawMain:
  ldx #0
  lda ($20,x)
  cmp #$ff
  beq done
  sta ($22,x)
  inc $20
  lda $20
  cmp #$00
  bne n1
  inc $21
n1:
  inc $22
  lda $22 
  cmp #$00
  bne done
  lda $23
  cmp #$05
  beq done
  inc $23
done:
  rts

picture:
  .byte 0,0,0,0,0,0,0,0,0,$b,$b,$c,$f,$f,$f,$f
  .byte $f,$b,0,0,0,$b,$b,$c,$c,$f,$f,$b,0,0,0,0
  .byte 0,0,0,0,0,0,0,0,0,$b,$c,$c,$f,$c,$f,$f
  .byte $b,$b,$b,$b,$b,0,$b,$b,$c,$f,$f,$c,0,0,0,0
  .byte 0,0,0,0,0,0,0,$b,0,$c,$b,$f,$c,$f,$f,$c
  .byte $c,$b,0,$b,$c,$c,$c,$f,$f,1,$f,$c,$b,0,0,0
  .byte 0,0,0,0,0,0,0,0,$b,$b,$c,$c,$c,$f,$f,$f
  .byte $c,$c,$c,$c,$c,$c,$f,$c,$f,$f,$f,$f,$b,0,0,0
  .byte 0,0,0,0,0,0,0,$b,0,0,$b,$c,$c,$f,$f,$f
  .byte $f,$c,$f,$f,$f,$f,$f,$f,$f,1,$f,$f,$c,0,0,0
  .byte 0,0,0,0,0,0,0,0,0,$b,$b,$b,$c,$f,$f,1
  .byte $f,$f,$c,$f,$f,$f,1,$f,$f,$f,$f,$f,$f,0,0,0
  .byte 0,0,0,0,0,0,0,0,0,$b,$b,$b,$b,$c,$f,1
  .byte $f,$f,$f,$f,$f,$f,$f,$f,1,$f,$f,$f,$f,$b,0,0
  .byte 0,0,0,0,0,0,0,0,$b,0,$b,$c,$b,$c,$c,1
  .byte 1,$f,1,$f,1,$f,1,$f,$f,1,$f,$f,1,$b,0,0
  .byte 0,0,0,0,0,0,0,$b,$b,$b,$c,$c,$b,$c,$f,1
  .byte 1,1,$f,$f,1,$f,$f,1,$f,$f,$f,$f,1,$c,0,0
  .byte 0,0,0,0,0,0,0,$b,$b,$c,$c,$c,$b,$c,$c,$f
  .byte 1,1,1,$f,$f,1,$f,1,$f,1,$f,$f,1,$c,0,0
  .byte 0,0,0,0,0,$b,$b,$b,$c,$c,$c,$f,$c,$c,$f,$f
  .byte 1,1,1,1,$f,$f,$f,1,$f,1,$f,$f,$f,$f,0,0
  .byte 0,0,0,0,0,0,$b,$c,$c,$c,$f,$c,$f,$c,$f,$f
  .byte 1,1,1,1,1,$f,$f,1,$f,$f,$f,$f,1,$f,$b,0
  .byte 0,0,0,0,$b,$b,$b,$c,$c,$f,$c,$f,$f,$c,$f,$f
  .byte 1,1,1,1,1,$f,$f,$f,1,$f,$f,$f,1,$c,$b,$b
  .byte 0,0,0,0,$b,$b,$c,$f,$c,$f,$f,$f,$f,$f,$c,$f
  .byte 1,1,1,1,1,$f,$f,$f,1,$f,$f,$f,$f,$f,$b,$b
  .byte 0,0,0,0,$b,$c,$c,$c,$f,$f,$f,$f,$f,$f,$f,$f
  .byte $f,1,1,1,$f,$b,$f,$f,$f,1,$f,$f,$f,$f,$b,$b
  .byte 0,0,0,0,$b,$c,$c,$f,$c,$f,$f,$f,$f,$f,$f,$f
  .byte $f,$f,$f,$c,$b,$f,$f,1,$f,$f,$f,$f,$f,$f,$c,$b
  .byte 0,0,0,0,$b,$b,$c,$c,$f,$c,$f,$f,$f,$f,$f,$f
  .byte $c,$c,$b,$c,$c,$f,$f,1,$c,$c,$f,$f,$f,$f,$c,$b
  .byte 0,0,0,0,$b,$b,$c,$c,$c,$f,$f,$f,$f,$f,$f,$f
  .byte $f,$f,$f,$f,$f,1,$f,$c,$b,$f,$c,$f,$c,$f,$c,$b
  .byte 0,0,0,0,0,$b,$c,$c,$c,$c,$f,$f,$f,$f,$f,$f
  .byte $f,$f,$f,$f,$f,$c,$b,$c,$c,$c,$f,$f,$c,$f,$c,$c
  .byte 0,0,0,0,0,$b,$b,$c,$c,$c,$c,$c,$f,$f,$f,$f
  .byte $f,$f,$f,$c,$b,$b,$c,$c,$c,$f,$c,$f,$f,$f,$c,$b
  .byte 0,0,0,0,0,$b,$b,$b,$b,$c,$c,$f,$c,$f,$f,$f
  .byte $c,$c,$b,$b,$b,$c,$b,$b,$c,$c,$f,$c,$c,$f,$c,$c
  .byte 0,0,0,0,0,0,$b,$b,$c,$b,$c,$c,$c,$c,$c,$c
  .byte $b,$b,$b,$b,$c,$b,$b,$c,$c,$f,$f,$f,$c,$c,$c,$b
  .byte 0,0,0,0,0,0,0,0,$b,$b,$b,$c,$c,$c,$c,$c
  .byte $c,$c,$b,$b,$b,$b,$c,$c,$f,$f,$f,$c,$c,$c,$c,$c
  .byte $ff


fontSize:
  .byte 5,5,5,5,5,5,5,5 ;abcdefgh
  .byte 2,5,5,5,6,6,5,5 ;ijklmnop
  .byte 6,5,5,4,5,6,6,6 ;qrstuvwx
  .byte 6,5,2,3         ;yz.[SPACE]

;
; a=0, b=1, c=2, d=3....
;

scrolltext:
  .byte 0

  .byte 14,13,11,24,27           ; "only "
  .byte 03,04,15,19,07,27        ; "depth "
  .byte 12,0,10,4,18,27          ; "makes "
  .byte 8,19,27                  ; "it "
  .byte 15,14,18,18,8,1,11,4     ; "possible"
  .byte 26,26,26                 ; "..."
  .byte 19,7,8,18,27             ; "this "
  .byte 8,18,27                  ; "is "
  .byte 19,7,4,27                ; "the "
  .byte 5,8,17,18,19,27          ; "first "
  .byte 3,4,12,14,27             ; "demo "
  .byte 12,0,3,4,27              ; "made "
  .byte 8,13,27                  ; "in "
  .byte 19,7,8,18,27             ; "this "
  .byte 4,13,21,26,26,26,26,27   ; "env.... "
  .byte 7,14,15,4,27             ; "hope "
  .byte 24,14,20,27              ; "you "
  .byte 11,8,10,4,27             ; "like "
  .byte 8,19,26,26,26,27,27      ; "it...  "
  .byte 22,22,22,26              ; "www."
  .byte 3,4,15,19,7,26           ; "depth."
  .byte 14,17,6,27,27,27,27,27   ; "org     "

  .byte $ff                      ; end of text

fontlookup:
  .byte $00,$00 ;a
  .byte $20,$00 ;b
  .byte $40,$00 ;c
  .byte $60,$00 ;d
  .byte $80,$00 ;e
  .byte $a0,$00 ;f
  .byte $c0,$00 ;g
  .byte $e0,$00 ;h
  .byte $00,$01 ;i
  .byte $20,$01 ;j
  .byte $40,$01 ;k
  .byte $60,$01 ;l
  .byte $80,$01 ;m
  .byte $a0,$01 ;n
  .byte $c0,$01 ;o
  .byte $e0,$01 ;p
  .byte $00,$02 ;q
  .byte $20,$02 ;r
  .byte $40,$02 ;s
  .byte $60,$02 ;t
  .byte $80,$02 ;u
  .byte $a0,$02 ;v
  .byte $c0,$02 ;w
  .byte $e0,$02 ;x
  .byte $00,$03 ;y
  .byte $20,$03 ;z
  .byte $40,$03 ;.
  .byte $60,$03 ;" "

fonts:
  .byte 0,1,1,0,0,0
  .byte 1,0,0,1,0,0
  .byte 1,1,1,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,0

  .byte 0,1,1,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,1,0,0
  .byte 0,0

  .byte 0,1,1,0,0,0
  .byte 1,0,0,1,0,0
  .byte 0,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,0,0,0
  .byte 0,0

  .byte 0,1,1,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,1,0,0
  .byte 0,0

  .byte 1,1,1,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,1,1,1,0,0
  .byte 0,0,0,1,0,0
  .byte 1,1,1,1,0,0
  .byte 0,0

  .byte 1,1,1,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,1,1,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,0

  .byte 1,1,1,0,0,0
  .byte 0,0,0,1,0,0
  .byte 1,1,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,1,1,0,0,0
  .byte 0,0

  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,1,1,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,0

  .byte 1,0,0,0,0,0
  .byte 1,0,0,0,0,0
  .byte 1,0,0,0,0,0
  .byte 1,0,0,0,0,0
  .byte 1,0,0,0,0,0
  .byte 0,0

  .byte 1,0,0,0,0,0
  .byte 1,0,0,0,0,0
  .byte 1,0,0,0,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,0,0,0
  .byte 0,0

  .byte 1,0,0,1,0,0
  .byte 0,1,0,1,0,0
  .byte 0,0,1,1,0,0
  .byte 0,1,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,0

  .byte 0,0,0,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,0,0,1,0,0
  .byte 1,1,1,1,0,0
  .byte 0,0

  .byte 1,0,0,0,1,0
  .byte 1,1,0,1,1,0
  .byte 1,0,1,0,1,0
  .byte 1,0,0,0,1,0
  .byte 1,0,0,0,1,0
  .byte 0,0

  .byte 1,0,0,0,1,0
  .byte 1,0,0,1,1,0
  .byte 1,0,1,0,1,0
  .byte 1,1,0,0,1,0
  .byte 1,0,0,0,1,0
  .byte 0,0

  .byte 0,1,1,0,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,0,0,0
  .byte 0,0

  .byte 0,1,1,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,0,0,1,0,0
  .byte 0,0

  .byte 0,1,1,0,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,0,1,0,0
  .byte 1,0,1,0,0,0
  .byte 0,0

  .byte 0,1,1,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,1,1,1,0,0
  .byte 0,1,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 0,0

  .byte 1,1,1,0,0,0
  .byte 0,0,0,1,0,0
  .byte 0,1,1,0,0,0
  .byte 1,0,0,0,0,0
  .byte 0,1,1,1,0,0
  .byte 0,0

  .byte 1,1,1,0,0,0
  .byte 0,1,0,0,0,0
  .byte 0,1,0,0,0,0
  .byte 0,1,0,0,0,0
  .byte 0,1,0,0,0,0
  .byte 0,0

  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,0,0,1,0,0
  .byte 1,1,1,0,0,0
  .byte 0,0

  .byte 1,0,0,0,1,0
  .byte 1,0,0,0,1,0
  .byte 1,0,0,0,1,0
  .byte 0,1,0,1,0,0
  .byte 0,0,1,0,0,0
  .byte 0,0

  .byte 1,0,0,0,1,0
  .byte 1,0,0,0,1,0
  .byte 1,0,1,0,1,0
  .byte 1,1,0,1,1,0
  .byte 1,0,0,0,1,0
  .byte 0,0

  .byte 1,0,0,0,1,0
  .byte 0,1,0,1,0,0
  .byte 0,0,1,0,0,0
  .byte 0,1,0,1,0,0
  .byte 1,0,0,0,1,0
  .byte 0,0

  .byte 1,0,0,0,1,0
  .byte 0,1,0,1,0,0
  .byte 0,0,1,0,0,0
  .byte 0,0,1,0,0,0
  .byte 0,0,1,0,0,0
  .byte 0,0

  .byte 1,1,1,1,0,0 ; z
  .byte 1,0,0,0,0,0
  .byte 0,1,1,0,0,0
  .byte 0,0,0,1,0,0
  .byte 1,1,1,1,0,0
  .byte 0,0

  .byte 0,0,0,0,0,0 ; .
  .byte 0,0,0,0,0,0
  .byte 0,0,0,0,0,0
  .byte 0,0,0,0,0,0
  .byte 1,0,0,0,0,0
  .byte 0,0

  .byte 0,0,0,0,0,0 ; " "
  .byte 0,0,0,0,0,0
  .byte 0,0,0,0,0,0
  .byte 0,0,0,0,0,0
  .byte 0,0,0,0,0,0
  .byte 0,0

bottombar:
  .byte $b,$9,$b,9,8,9,8,$a,8,$a,7,$a,7,1,7,1,1
  .byte 7,1,7,$a,7,$a,8,$a,8,9,8,9,$b,9,$b
  .byte $ff

