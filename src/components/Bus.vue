<script setup>
const props = defineProps({
  e: Boolean,
})
</script>

<style>
.bus {

    height: 1%;
    position: relative;
    border-width: 2px;
    border-style: solid;
    border-radius: 0%;
}


</style>

<template>
  <div class="bus"  :style="e ? 'background-color:  var(--line-on); border-color: var(--line-on)':'background-color:  var(--line-off); border-color: var(--line-off)'">
  </div>
</template>
