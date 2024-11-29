<script setup>
import Breaker from './Breaker.vue'
import Sec from './Sec.vue'
const props = defineProps({
  brk_1: Object,
  brk_2: Object,
  sec: Object,
})
</script>

<style>
  .grp {
    height: 180px;
    width: 20px;
    position: relative;
  }
  #brk_1 {
    top: 0px;
    left: 0px;
    width: 100%;
    height: calc(100% / 3);
  }
  #sec {
    top: calc(100% / 3);
    left: 0px;
    width: 100%;
    height: calc(100% / 3);
  }
  #brk_2 {
    top: calc((100% / 3)*2);
    left: 0px;
    width: 100%;
    height: calc(100% / 3);
  }
</style>

<template>
  <div class="grp">
    <Breaker id="brk_1" :state="brk_1"></Breaker>
    <Sec  id="sec" :state="sec"></Sec>
    <Breaker id="brk_2" :state="brk_2"></Breaker>
  </div>
</template>
