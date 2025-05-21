<script setup>
import Breaker from '../components/Breaker.vue'
import Bus from '../components/Bus.vue'
import V_line from '../components/V_line.vue'
import sec_brk from '../components/sec_brk.vue'
import src from '../components/src.vue'
import {ref, shallowRef,  onMounted} from "vue"
import { createClient } from 'graphql-ws';
import { SUBS_MEAS, SUBS_ALM } from "@/subscription";
import { Node_1, Node_2, TopProc } from '../topological_processor';
import authService from '../services/auth.service';

var state = {"brk_10": {"close": false, "term_1": true, "term_2": true},
  "brk_11": {"close": false, "term_1": true, "term_2": true},
  "sec_1": {"close": false, "term_1": true, "term_2": true},

  "brk_20": {"close": false, "term_1": true, "term_2": true},
  "brk_21": {"close": false, "term_1": true, "term_2": true},
  "sec_2": {"close": false, "term_1": true, "term_2": true},

  "brk_30": {"close": false, "term_1": true, "term_2": true},
  "brk_31": {"close": false, "term_1": true, "term_2": true},
  "sec_3": {"close": false, "term_1": true, "term_2": true},

  "brk_40": {"close": false, "term_1": true, "term_2": true},
  "brk_41": {"close": false, "term_1": true, "term_2": true},
  "sec_4": {"close": false, "term_1": true, "term_2": true},

  "brk_d": {"close": false, "term_1": true, "term_2": true},
};

const alms = shallowRef([])
const client = ref(null)

var brk10 = new Node_2("brk_10");
var brk11 = new Node_2("brk_11");
var brk20 = new Node_2("brk_20");
var brk21 = new Node_2("brk_21");
var brk30 = new Node_2("brk_30");
var brk31 = new Node_2("brk_31");
var brk40 = new Node_2("brk_40");
var brk41 = new Node_2("brk_41");
var sec1 = new Node_2("sec_1");
var sec2 = new Node_2("sec_2");
var sec3 = new Node_2("sec_3");
var sec4 = new Node_2("sec_4");
var main = new Node_1();
var bus1 = new Node_1();
var bus2 = new Node_1();
var brkd = new Node_2("brk_d");

brk10.connections_1 = [[main, 1]];
brk10.connections_2 = [[sec1, 1]];
brk11.connections_1 = [[sec1, 2]];
brk11.connections_2 = [[bus1, 1]];
sec1.connections_1 = [[brk10, 2]];
sec1.connections_2 = [[brk11, 1]];

brk20.connections_1 = [[main, 1]];
brk20.connections_2 = [[sec2, 1]];
brk21.connections_1 = [[sec2, 2]];
brk21.connections_2 = [[bus2, 1]];
sec2.connections_1 = [[brk20, 2]];
sec2.connections_2 = [[brk21, 1]];

brk30.connections_1 = [[bus1, 1]];
brk30.connections_2 = [[sec3, 1]];
brk31.connections_1 = [[sec3, 2]];
brk31.connections_2 = [[brkd, 1]];
sec3.connections_1 = [[brk30, 2]];
sec3.connections_2 = [[brk31, 1]];

brk40.connections_1 = [[bus2, 1]];
brk40.connections_2 = [[sec4, 1]];
brk41.connections_1 = [[sec4, 2]];
brk41.connections_2 = [[brkd, 1]];
sec4.connections_1 = [[brk40, 2]];
sec4.connections_2 = [[brk41, 1]];

bus1.connections = [[brk11, 2], [brk30, 1]];
bus2.connections = [[brk21, 2], [brk40, 1]];
brkd.connections_1 = [[brk31, 2], [brk41, 2]];
main.connections = [[brk10, 1], [brk20, 1]];

var top_proc = new TopProc([brk10, brk11,brk20,brk21,brk30,brk31,brk40,brk41,
sec1,sec2,sec3,sec4,bus1,bus2,brkd,], main)
top_proc.calculate(state);

const ref_state = shallowRef({...state});

// Initialize WebSocket connection with access token
const initializeWebSocket = async () => {
  try {
    const accessToken = await authService.getAccessToken()
    if (!accessToken) {
      console.error('No access token available')
      return
    }

    client.value = createClient({
      url: `https://api.scada.mzaniolo.net/ws?token=${accessToken}`,
    })

    // Start subscriptions
    startSubscriptions()
  } catch (error) {
    console.error('Error initializing WebSocket:', error)
  }
}

// Handle subscriptions
const startSubscriptions = async () => {
  if (!client.value) return

  // Start both subscriptions in parallel
  const startMeasurementsSubscription = async () => {
    try {
      const subscription = client.value.iterate({
        query: SUBS_MEAS,
      })

      for await (const event of subscription) {
        let name = event.data.tagSubscribe.name
        let value = event.data.tagSubscribe.value
        let timestamp = event.data.tagSubscribe.timestamp
        console.log("name: ", name," value: ", value," timestamp: ", timestamp)

        state[name].close = Boolean(value)
        top_proc.calculate(state)
        ref_state.value = {...state}
      }
    } catch (error) {
      console.error('Error in measurements subscription:', error)
    }
  }

  const startAlarmsSubscription = async () => {
    try {
      const subscription = client.value.iterate({
        query: SUBS_ALM,
      })

      for await (const event of subscription) {
        let name = event.data.almSubscribe.name
        let value = event.data.almSubscribe.value
        let timestamp = event.data.almSubscribe.timestamp
        console.log("alm - name: ", name," value: ", value," timestamp: ", timestamp)

        // Create new array with the new alarm at the beginning
        const new_alm = [event.data.almSubscribe, ...alms.value]

        // Keep only the first 10 alarms
        alms.value = new_alm.slice(0, 10)
      }
    } catch (error) {
      console.error('Error in alarms subscription:', error)
    }
  }

  // Start both subscriptions concurrently
  Promise.all([
    startMeasurementsSubscription(),
    startAlarmsSubscription()
  ]).catch(error => {
    console.error('Error in subscriptions:', error)
  })
}

const clearAlarms = () => {
  alms.value = []
}

// Initialize when component is mounted
onMounted(() => {
  initializeWebSocket()
})
</script>

<template>
  <div id="grid_container">
    <header>
      <h1 style="text-align: center;">Demo Substation</h1>
    </header>

    <main>
      <sec_brk id="sec_brk_1" brk_1="brk_10" brk_2="brk_11" sec="sec_1" :state="ref_state"></sec_brk>
      <sec_brk id="sec_brk_3" brk_1="brk_30" brk_2="brk_31" sec="sec_3" :state="ref_state"></sec_brk>
      <V_line id="l_3" :e="ref_state.brk_30.term_1"></V_line>
      <Bus id="bus_1" :e="ref_state.brk_30.term_1 || ref_state.brk_11.term_2"></Bus>

      <sec_brk id="sec_brk_2" brk_1="brk_20" brk_2="brk_21" sec="sec_2" :state="ref_state"></sec_brk>
      <V_line id="l_2" :e="ref_state.brk_21.term_1 && ref_state.brk_21.close"></V_line>
      <sec_brk id="sec_brk_4" brk_1="brk_40" brk_2="brk_41" sec="sec_4" :state="ref_state"></sec_brk>
      <Bus id="bus_2" :e="ref_state.brk_40.term_1 || ref_state.brk_21.term_2"></Bus>

      <Breaker id="brk_d" name="brk_d" :state="ref_state"></Breaker>
      <V_line id="l_34" :e="ref_state.brk_d.term_1"></V_line>
      <V_line id="l_12" :e="ref_state.brk_10.term_1"></V_line>

      <src id="src" e></src>
    </main>

    <div id="alarms">
      <div class="alarms-header">
        <h3>Top 10 last alarms</h3>
        <button @click="clearAlarms" class="clear-button">Clear Alarms</button>
      </div>
      <p>name - value - state - ack - severity - timestamp</p>
      <li v-for="item in alms.reverse()">
        {{ item.name }} - {{ item.value }} - {{ item.state }} - {{ item.ack }} - {{ item.severity }} - {{ item.timestamp }}
      </li>
    </div>
  </div>
</template>

<style>
:root {
  --on: rgb(80,80,80);
  --off: rgb(28, 28, 28);
  --off-brd: rgb(61,61,61);
  --sec-on: rgb(35,35,35);

  --line-on: rgb(69, 71, 53);
  --line-off: rgb(41, 41, 41);

  --background: rgb(30, 30, 30);

  --scale: 20px;

  --brk-h: calc(var(--scale)*3);
  --sec-h: calc(var(--scale)*3);

  --brk-w: var(--scale);
  --sec-w: var(--scale);
}

#src{
    top: 1.6%;
    left: 37.5%;
    height: calc(var(--scale)*1.5);
    width: var(--brk-w);
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
#sec_brk_1{
  top: calc(10%/3 *2);
  left: 25%;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;

  }
  #sec_brk_2{
  top: calc(10%/3 *2);
  left: 50%;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;
  }
  #sec_brk_3{
  top: calc(40% + 10%/3 * 2);
  left: 37.5%;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;
  }
  #sec_brk_4{
  top: calc(40% + 10%/3 * 2);
  left: 62.5%;
  height: calc(var(--brk-h)*3);
  width: var(--brk-w);
  position: absolute;
  }

  #bus_1{
    left: 7.5%;
    top: calc(30% + 10%/3 * 2);
    width: calc(var(--brk-w)*15);
    position: absolute;
  }

  #bus_2{
    left: 7.5%;
    top: calc(40% + 10%/3 * 2);
    width: calc(var(--brk-w)*15);
    position: absolute;
  }

  #brk_d{
    height: var(--brk-h);
    width:  var(--brk-w);
    top: calc(70% + 10%/3 * 2);
    left: 50%;
    position: absolute;
  }

  #l_34{
    width: 25.5%;
    height: calc(1%/3);
    top: calc(70% + 10%/3 * 2);
    left: 39.75%;
    position: absolute;
  }
  #l_12{
    width: 25.5%;
    height: calc(1%/3);
    top: calc(6% + 1%/3);
    left: 27.25%;
    position: absolute;
  }

  #l_2{
    width: 0.75%;
    height: 10%;
    top: calc(30% + 10%/3 * 2);
    left: 52.25%;
    position: absolute;
  }

  #l_3{
    width: 0.75%;
    height: 10%;
    top: calc(30% + 10%/3 * 2);
    left: 39.75%;
    position: absolute;
  }




header {
  line-height: 1.5;
  grid-area: header;
}

main{
  background-color: var(--background);
  margin-top: 10px;
  height: calc(var(--scale)*30);
  width: calc(var(--scale)*20);
  position: relative;
  /* left: 50%;
  transform: translateX(-50%); */
  grid-area: main;
  justify-self: right;
  padding: 15px;
}

#alarms {
  grid-area: alarm;
  font-size: small;
  justify-self: left;
  padding: 15px;
}

#grid_container{
  display: grid;
  width: 100%;
  grid-template-columns: 50% 50%;
  grid-template-rows: auto;
  grid-template-areas:
    "header header"
    "main alarm "
    "main alarm";
}

.alarms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.clear-button {
  padding: 0.5rem 1rem;
  background-color: var(--on);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: var(--line-on);
}
</style>
