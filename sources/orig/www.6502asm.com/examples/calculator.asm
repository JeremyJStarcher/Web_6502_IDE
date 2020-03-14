; Calculator for 6502asm.com, Version 1.02, 2015.JUL.08 by Sid Liu
; It is slow in the 6502 emulator by JavaScript.
; The left top flash point is a busy indicator.
; The calculator supports keys: 'C', 'c', '0', '1', ..., '9', '+', '-' and '='.

main:               cld

                    jsr display

                    ; comparison loop for well response
getch_main:         lda $ff
                    cmp #67 ; 'C' for clear
                    beq store_main
                    cmp #99 ; 'c' for clear
                    beq store_main

                    cmp #43 ; '+'
                    beq store_main
                    cmp #45 ; '-'
                    beq store_main
                    cmp #61 ; '='
                    beq store_main

                    cmp #48 ; '0'
                    bmi getch_main
                    cmp #57 ; '9'
                    beq store_main
                    bpl getch_main

store_main:         sta key_main

                    ; clear key
                    lda #0
                    sta $ff

                    ; clear operand 2 by 'C' or 'c'
                    lda key_main
                    cmp #67
                    beq clear_main
                    cmp #99
                    beq clear_main
                    jmp operate_main

clear_main:         jsr clear
                    lda #61
                    sta _operator1
                    lda #0
                    sta still_main
                    sta standby_main

                    jsr display
                    jmp getch_main

                    ; operate operand 1 and operand 2
operate_main:       lda key_main
                    cmp #43 ; '+'
                    bne next1_main

                    sta _operator2

                    lda just_main
                    bne jump1_main

                    jsr operate

                    lda #1
                    sta standby_main
                    sta just_main
jump1_main:         jmp getch_main
                    
next1_main:         lda key_main
                    cmp #45 ; '-'
                    bne next2_main

                    sta _operator2

                    lda just_main
                    bne jump2_main

                    jsr operate

                    lda #1
                    sta standby_main
                    sta just_main
jump2_main:         jmp getch_main

next2_main:         lda key_main
                    cmp #61 ; '='
                    bne replace_main

                    sta _operator2

                    lda just_main
                    bne jump3_main

                    jsr operate
                    lda #61
                    sta _operator1

                    lda #1
                    sta standby_main
                    sta just_main
jump3_main:         jmp getch_main

replace_main:       lda standby_main
                    beq full_main
                    jsr move
                    jsr clear
                    lda #0
                    sta standby_main
                    jmp append_main

                    ; whether full of digits
full_main:          jsr length
                    lda $00
                    cmp #5
                    bne next3_main
                    jmp getch_main

next3_main:         lda still_main
                    beq append_main

                    ; shift digits
                    ldx #3

shift_main:         clc
                    lda _operand2,x
                    stx tmp_main
                    ldy tmp_main
                    iny
                    clc
                    sta _operand2,y
                    dex
                    txa
                    bpl shift_main

                    ; append digit
append_main:        lda #1
                    sta still_main
                    lda #0
                    sta just_main

                    lda key_main
                    sta _operand2

                    ; replace '0' with 's'
                    ldx #4

loop_main:          lda _operand2,x
                    cmp #48
                    beq space_main
                    cmp #115
                    beq next4_main
                    jmp display_main

space_main:         lda #115
                    sta _operand2,x

next4_main:         dex
                    beq display_main ; "XXXXY"
                    bpl loop_main

display_main:       jsr display
                    jmp getch_main

; global variables
_operand1:          dcb 48,115,115,115,115 ; 's' for space
_operator1:         dcb 61 ; '='
_operand2:          dcb 48,115,115,115,115
_operator2:         dcb 115

; local variables
key_main:           dcb 0
tmp_main:           dcb 0
still_main:         dcb 0 ; boolean, still editing flag
standby_main:       dcb 0 ; boolean, preparing to move and clear flag
just_main:          dcb 0 ; boolean, just operator key flag

operate:            ; operate operand 1 and operand 2

                    lda _operator1
                    cmp #43 ; '+'
                    beq add_operate
                    cmp #45 ; '-'
                    beq sub_operate
                    jmp end_operate

add_operate:        jsr add
                    jsr display
                    jmp end_operate

sub_operate:        jsr sub
                    jsr display

end_operate:        rts

add:                ; add operand 1 and operand 2

                    ldx #0

                    ldy #0
                    sty carry_add

loop1_add:          clc
                    lda _operand2,x
                    cmp #115
                    beq space1_add
                    sec
                    sbc #48
                    sta digit_add
                    jmp next1_add

space1_add:         lda #0
                    sta digit_add

next1_add:          clc
                    lda _operand1,x
                    cmp #115
                    beq space2_add
                    sec
                    sbc #48
                    jmp next2_add

space2_add:         lda #0

next2_add:          clc
                    adc digit_add
                    clc
                    adc carry_add

                    ldy #0
                    sty carry_add

                    cmp #10
                    bmi ascii_add

                    sec
                    sbc #10

                    ldy #1
                    sty carry_add

ascii_add:          clc
                    adc #48
                    clc
                    sta _operand2,x

                    inx
                    cpx #5
                    bmi loop1_add

                    ; replace '0' with 's'
                    ldx #4

loop2_add:          lda _operand2,x
                    cmp #48
                    bne end_add
                    lda #115
                    sta _operand2,x

                    dex
                    beq end_add ; "XXXXY"
                    bpl loop2_add

end_add:            rts

; local variables
digit_add:          dcb 0
carry_add:          dcb 0

sub:                ; sub operand 1 and operand 2


                    ldx #0

                    ldy #0
                    sty borrow_sub

loop1_sub:          clc
                    lda _operand2,x
                    cmp #115
                    beq space1_sub
                    sec
                    sbc #48
                    sta digit_sub
                    jmp next1_sub

space1_sub:         lda #0
                    sta digit_sub

next1_sub:          clc
                    lda _operand1,x
                    cmp #115
                    beq space2_sub
                    sec
                    sbc #48
                    jmp next2_sub

space2_sub:         lda #0

next2_sub:          sec
                    sbc digit_sub
                    sec
                    sbc borrow_sub

                    ldy #0
                    sty borrow_sub

                    cmp #0
                    bpl ascii_sub

                    clc
                    adc #10

                    ldy #1
                    sty borrow_sub

ascii_sub:          clc
                    adc #48
                    clc
                    sta _operand2,x

                    inx
                    cpx #5
                    bmi loop1_sub

                    ; replace '0' with 's'
                    ldx #4

loop2_sub:          lda _operand2,x
                    cmp #48
                    bne end_sub
                    lda #115
                    sta _operand2,x

                    dex
                    beq end_sub ; "XXXXY"
                    bpl loop2_sub

end_sub:            rts

; local variables
digit_sub:          dcb 0
borrow_sub:         dcb 0

length:             ; compute the length of operand 2
; input void; output $00;

                    ldx #0

loop_length:        cpx #5
                    beq end_length
                    clc
                    lda _operand2,x
                    inx
                    cmp #115
                    bne loop_length

                    dex

end_length:         stx $00
                    rts

move:               ; move operand 2 to operand 1
                    ; move operator 2 to operator 1

                    ldx #4

loop_move:          clc
                    lda _operand2,x
                    sta _operand1,x

                    dex
                    bpl loop_move

                    ; move operator 2 to operator 1
                    lda _operator2
                    sta _operator1

                    rts

clear:              ; clear operand 2

                    lda #4
                    sta count_clear

loop_clear:         lda #115
                    ldx count_clear
                    clc
                    sta _operand2,x
                    dec count_clear
                    lda count_clear
                    cmp #1
                    bpl loop_clear

                    lda #48
                    sta _operand2

                    rts

; local variables
count_clear:        dcb 0

display:            ; display operand 2

                    lda #4
                    sta count_display

loop_display:       lda count_display
                    sta $00
                    inc $00
                    lda #6
                    sta $01
                    jsr cmul
                    lda #32
                    sec
                    sbc $02
                    sta $00 ; 32-(count+1)*6
                    lda #22
                    sta $01
                    ldx count_display
                    clc
                    lda _operand2,x
                    sta $02
                    jsr draw

                    dec count_display
                    lda count_display
                    bpl loop_display 

                    rts

; local variables
count_display:      dcb 0

draw:               ; draw a digit
; input char x $00, char y $01,char digit $02; output void;

                    lda $00
                    sta x_draw
                    lda $01
                    sta y_draw

                    lda $02
                    cmp #115
                    bne digital_draw
                    lda #$ff ; -1 for space
                    sta value_draw
                    jmp init_draw
digital_draw:       sec
                    sbc #48
                    sta value_draw

init_draw:          lda #0
                    sta i_draw
                    sta j_draw

loop_draw:          ; converse white
                    lda i_draw
                    cmp #0
                    bne converse_draw
                    lda #1
                    sta $00
                    sta $01
                    lda #$01
                    sta $02
                    jsr pixel

                    ; converse black
converse_draw:      lda i_draw
                    cmp #3
                    bne start_draw
                    lda #1
                    sta $00
                    sta $01
                    lda #$00
                    sta $02
                    jsr pixel

start_draw:         lda value_draw
                    sta $00
                    bmi black_draw

                    lda #9
                    sta $01
                    jsr cmul
                    lda $02
                    clc
                    adc j_draw
                    tay
                    clc
                    lda font_draw,y ; byte=[font+value*9+j]
                    sta byte_draw

                    lda #1
                    sta mask_draw

                    ldx i_draw
shift_draw:         beq and_draw
                    asl mask_draw
                    dex
                    jmp shift_draw

and_draw:           lda mask_draw
                    and byte_draw
                    beq black_draw
white_draw:         lda #$01
                    sta color_draw
                    jmp pixel_draw
black_draw:         lda #$00
                    sta color_draw

pixel_draw:         lda i_draw
                    clc
                    adc x_draw
                    sta $00
                    lda j_draw
                    clc
                    adc y_draw
                    sta $01
                    lda color_draw
                    sta $02
                    jsr pixel

                    ; increase for next step
                    inc i_draw
                    lda i_draw
                    cmp #5
                    bpl next_draw
                    jmp loop_draw
next_draw:          lda #0
                    sta i_draw
                    inc j_draw
                    lda j_draw
                    cmp #9
                    bpl end_draw
                    jmp loop_draw

end_draw:           rts

; local variables
x_draw:             dcb 0
y_draw:             dcb 0
value_draw:         dcb 0
i_draw:             dcb 0
j_draw:             dcb 0
mask_draw:          dcb 0
byte_draw:          dcb 0
color_draw:         dcb 0

font_draw:          ; '0'~'9', 5x9
dcb $0e,$11,$11,$13,$15,$19,$11,$11,$0e
dcb $04,$06,$04,$04,$04,$04,$04,$04,$0e
dcb $0e,$11,$10,$10,$08,$04,$02,$01,$1f
dcb $0e,$11,$10,$10,$0e,$10,$10,$11,$0e
dcb $08,$0c,$0a,$09,$09,$09,$1f,$08,$08
dcb $1f,$01,$01,$01,$0f,$10,$10,$11,$0e
dcb $0e,$11,$01,$01,$0f,$11,$11,$11,$0e
dcb $1f,$11,$10,$10,$08,$08,$08,$04,$04
dcb $0e,$11,$11,$11,$0e,$11,$11,$11,$0e
dcb $0e,$11,$11,$11,$1e,$10,$10,$10,$0e

pixel:              ; draw a pixel
; pixel page memory address, m=512+y*32+x
; (or m0=y%8*32+x, m1=2+y/8)
; color: $00 is black, $01 is white
; input char x $00,y $01,color $02; output void; effect $60, $61

                    lda $00
                    sta x_pixel
                    lda $01
                    sta y_pixel
                    lda $02
                    sta color_pixel

                    lda y_pixel
                    sta $00
                    lda #8
                    sta $01
                    jsr cmod
                    lda $02
                    sta $00
                    lda #32
                    sta $01
                    jsr cmul
                    lda $02
                    clc
                    adc x_pixel
                    sta $60 ; m0

                    lda y_pixel
                    sta $00
                    lda #8
                    sta $01
                    jsr cdiv
                    lda $02
                    clc
                    adc #2
                    sta $61 ; m1

                    ldy #0
                    lda color_pixel
                    clc
                    sta ($60),y

                    rts

; local variables
x_pixel:            dcb 0
y_pixel:            dcb 0
color_pixel:        dcb 0

cmod:               ; char modulus
; c=a%b=a-a/b*b
; input char a $00,b $01; output char c $02;

                    LDA $00
                    STA a_cmod

                    JSR cdiv
                    LDA $02
                    STA $00
                    JSR cmul
                    LDA $02
                    STA p_cmod

                    LDA a_cmod
                    SEC
                    SBC p_cmod

                    STA $02

                    RTS

a_cmod:             DCB 0
p_cmod:             DCB 0 ; p=a/b*b

cmul:               ; char multiply
; c=a*b
; input char a $00,b $01; output char c $02;

                    LDA #0
                    LDX $01

loop_cmul:          BEQ take_cmul
                    CLC
                    ADC $00
                    DEX
                    JMP loop_cmul

take_cmul:          STA $02

                    RTS

cdiv:               ; char divide
; c=a/b
; input char a $00,b $01; output char c $02;

                    LDA #0
                    LDX #0
                    CLC

loop_cdiv:          CMP $00

                    BEQ take2_cdiv
                    BPL take1_cdiv

                    ADC $01
                    BCS take2_cdiv

                    INX
                    JMP loop_cdiv          

take1_cdiv:         DEX

take2_cdiv:         STX $02

                    RTS
