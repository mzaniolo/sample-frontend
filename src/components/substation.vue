<script setup>
import Breaker from './Breaker.vue'
import Bus from './Bus.vue'
import V_line from './V_line.vue'
import sec_brk from './sec_brk.vue'
import src from './src.vue'

const props = defineProps({
  state: Object,
})
</script>

<style>
#src{
    top: 1.6%;
    left: 150px;
    height: 30px;
    width: var(--brk-w);
  }
#sec_brk_1{
  top: 40px;
  left: 100px;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;

  }
  #sec_brk_2{
  top: 40px;
  left: 200px;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;
  }
  #sec_brk_3{
  top: 280px;
  left: 150px;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;
  }
  #sec_brk_4{
  top: 280px;
  left: 250px;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;
  }

  #bus_1{
    left: 30px;
    top: 220px;
    width: calc(var(--brk-w)*15);
    position: absolute;
  }

  #bus_2{
    left: 30px;
    top: 280px;
    width: calc(var(--brk-w)*15);
    position: absolute;
  }

  #brk_d{
    height: var(--brk-h);
    width:  var(--brk-w);
    top: 460px;
    left: 200px;
    position: absolute;
  }

  #l_34{
    width: 102px;
    height: calc(1%/3);
    top: 460px;
    left: 159px;
    position: absolute;
  }
  #l_12{
    width: 102px;
    height: calc(1%/3);
    top: 38px;
    left: 109px;
    position: absolute;
  }

  #l_2{
    width: 2px;
    height: 60px;
    top: 220px;
    left: 209px;
    position: absolute;
  }

  #l_3{
    width: 2px;
    height: 60px;
    top: 220px;
    left: 159px;
    position: absolute;
  }


</style>

<template>
  <div>
    <sec_brk id="sec_brk_1" :brk_1="state.brk_10" :brk_2="state.brk_11" :sec="state.sec_1" ></sec_brk>
    <sec_brk id="sec_brk_3" :brk_1="state.brk_30" :brk_2="state.brk_31" :sec="state.sec_3"></sec_brk>
    <V_line id="l_3" :e="state.brk_30.term_1"></V_line>
    <Bus  id="bus_1" :e="state.brk_30.term_1 || state.brk_11.term_2 "></Bus>


    <sec_brk id="sec_brk_2" :brk_1="state.brk_20" :brk_2="state.brk_21" :sec="state.sec_2"></sec_brk>
    <V_line id="l_2" :e="state.brk_21.term && state.brk_21.close"></V_line>
    <sec_brk id="sec_brk_4" :brk_1="state.brk_40" :brk_2="state.brk_41" :sec="state.sec_4"></sec_brk>
    <Bus  id="bus_2" :e="state.brk_40.term_1 || state.brk_21.term_2 "></Bus>

    <Breaker id="brk_d" :state="state.brk_d"></Breaker>
    <V_line id="l_34" :e="state.brk_d.term_1"></V_line>
    <V_line id="l_12" :e="state.brk_10.term_1"></V_line>

    <src id="src" e></src>

  </div>
</template>
