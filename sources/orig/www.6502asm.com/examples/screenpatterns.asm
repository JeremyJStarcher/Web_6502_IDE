; Screen patterns 
;
; Quick hack - code could obviously be improved but this produces some fun and weird patterns. 
;
; Great job on the emulator!
; It reminds me of my Ohio Scientific Challenger 1P...
;
; Pete Laing

; Try hitting random keys on keyboard for
 
      ldy #$00   ;  clear y index
      lda $fe    ;  get a random number, temporarily save in X
loop: tax        ;  
      lda $ff    ;  get key from Keyboard
      pha        ;  save to stack as we mangle it displaying 
      sta $500   ;  display low nybble
      clc        ;  clear carry so we rotate in 0\'s
      ror        ;  now get low nybble
      ror
      ror
      ror 
      sta $501   ; display that too
      pla        ; get back original key from stack
                 ; not necessary if we swapped order above...   
                 
      and #$0f   ; extract it\'s least significant nybble
      sta $01    ; and save it on zero page
      txa        ; get back random number
      rol        ; shift to high nybble
      rol
      rol
      rol        ; Try eor $00 below and hit p y o x f multiple times
      eor $01    ; Try 1 and hit a, s, d, f for fun too   
      sta $200,y ; store to screen 
      sta $300,y 
      sta $400,y
      dey        
      sty $540   ; show y index 
;     jsr delay ; slow things down if you want
      jmp loop

delay: pha       ; save regs we use for loop
       txa
       pha       
       ldx #$ff    ; count=255 
loop2: dex         ; count=count-1
       lda $fe     ; get a random
       bne loop2   ; if count!=0 back to loop2
       pla         ; restore regs
       tax
       pla
       rts         ; return from subroutine
