<script setup>
import Breaker from './components/Breaker.vue'
import Bus from './components/Bus.vue'
import V_line from './components/V_line.vue'
import sec_brk from './components/sec_brk.vue'
import src from './components/src.vue'
import {ref} from "vue"
import { createClient } from 'graphql-ws';
import { SUBS_MEAS, SUBS_ALM } from "@/subscription";

const brk_10 = ref({"close": false, "term_1": true, "term_2": true});
const brk_11 = ref({"close": false, "term_1": true, "term_2": true});
const sec_1 = ref({"close": true, "term_1": true, "term_2": true});

const brk_20 = ref({"close": false, "term_1": true, "term_2": true});
const brk_21 = ref({"close": false, "term_1": true, "term_2": true});
const sec_2 = ref({"close": false, "term_1": true, "term_2": true});

const brk_30 = ref({"close": false, "term_1": true, "term_2": true});
const brk_31 = ref({"close": false, "term_1": true, "term_2": true});
const sec_3 = ref({"close": false, "term_1": true, "term_2": true});

const brk_40 = ref({"close": false, "term_1": false, "term_2": true});
const brk_41 = ref({"close": false, "term_1": true, "term_2": true});
const sec_4 = ref({"close": false, "term_1": true, "term_2": true});

const brk_d = ref({"close": false, "term_1": false, "term_2": false});

const alms = ref([])

function set_state(name, value){
  let equip = {
    "brk_10": brk_10, "brk_11": brk_11,"sec_1": sec_1,
    "brk_20": brk_20, "brk_21": brk_21,"sec_2": sec_2,
    "brk_30": brk_30, "brk_31": brk_31,"sec_3": sec_3,
    "brk_40": brk_40, "brk_41": brk_41,"sec_4": sec_4,
    "brk_d":brk_d
  }

  equip[name].value.close = Boolean(value);
}

const client = createClient({
  url: 'ws://localhost:8000/ws',
});


// Breaker and sec pos:
// 1 - Closed
// 0 - Open

// subscription
(async () => {
  const subscription = client.iterate({
    query: SUBS_MEAS,
  });

  for await (const event of subscription) {
    let name = event.data.tagSubscribe.name;
    let value = event.data.tagSubscribe.value;
    let timestamp = event.data.tagSubscribe.timestamp;
    console.log("name: ", name," value: ", value," timestamp: ", timestamp)

    set_state(name, value)

  }
})();

(async () => {
  const subscription = client.iterate({
    query: SUBS_ALM,
  });

  for await (const event of subscription) {
    let name = event.data.almSubscribe.name;
    let value = event.data.almSubscribe.value;
    let timestamp = event.data.almSubscribe.timestamp;
    console.log("alm - name: ", name," value: ", value," timestamp: ", timestamp)

    if (alms.value.length > 10) {
      alms.value.pop()
    }
    alms.value.push(event.data.almSubscribe)
  }
})();

</script>

<template>
  <header>
   <h1 style="text-align: center;">Demo Substation</h1>
  </header>

  <main>
    <sec_brk id="sec_brk_1" :brk_1="brk_10" :brk_2="brk_11" :sec="sec_1" ></sec_brk>
    <sec_brk id="sec_brk_3" :brk_1="brk_30" :brk_2="brk_31" :sec="sec_3"></sec_brk>
    <V_line id="l_3" :e="brk_30.term_1"></V_line>
    <Bus  id="bus_1" :e="brk_30.term_1 || brk_11.term_2 "></Bus>


    <sec_brk id="sec_brk_2" :brk_1="brk_20" :brk_2="brk_21" :sec="sec_2"></sec_brk>
    <V_line id="l_2" :e="brk_21.term && brk_21.close"></V_line>
    <sec_brk id="sec_brk_4" :brk_1="brk_40" :brk_2="brk_41" :sec="sec_4"></sec_brk>
    <Bus  id="bus_2" :e="brk_40.term_1 || brk_21.term_2 "></Bus>

    <Breaker id="brk_d" :state="brk_d"></Breaker>
    <V_line id="l_34" :e="brk_d.term_1"></V_line>
    <V_line id="l_12" e></V_line>

    <src id="src" e></src>

  </main>

  <div>
    <h3>Top 10 last alarms</h3>
    <p>name - value - state - ack - severity - timestamp</p>
    <li v-for="item in alms.reverse()">
    {{ item.name }} - {{ item.value }} - {{ item.state }} - {{ item.ack }} - {{ item.severity }} - {{ item.timestamp }}
  </li>
  </div>
</template>

<style >
:root{
  --on: rgb(80,80,80);
  --off:  rgb(28, 28, 28);
  --off-brd: rgb(61,61,61);
  --sec-on: rgb(35,35,35);

  --line-on: rgb(69, 71, 53);/*hwb(30 12% 76%);*/
  --line-off: rgb(41, 41, 41);/*hwb(30 12% 76%);*/

  --background: rgb(30, 30, 30);

  --scale: 20px;

  --brk-h: calc(var(--scale)*3);
  --sec-h: calc(var(--scale)*3);

  --brk-w: var(--scale);
  --sec-w: var(--scale);
}

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




header {
  line-height: 1.5;
}

main{
  background-color: var(--background);
  margin-top: 10px;
  height: calc(var(--scale)*30);
  width: calc(var(--scale)*20);
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

</style>
