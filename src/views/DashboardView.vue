<script setup>
import Breaker from '../components/Breaker.vue'
import Bus from '../components/Bus.vue'
import V_line from '../components/V_line.vue'
import sec_brk from '../components/sec_brk.vue'
import src from '../components/src.vue'
import {ref, shallowRef,  onMounted, computed} from "vue"
import { createClient } from 'graphql-ws';
import { request } from 'graphql-request';
import { SUBS_MEAS, SUBS_ALM, ALM_ACK } from "@/subscription";
import { Node_1, Node_2, TopProc } from '../topological_processor';
import authService from '../services/auth.service';
import { useRouter } from 'vue-router';

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

const alms = shallowRef({})
const client = ref(null)
const sortField = ref('timestamp')
const sortDirection = ref('desc')
const columnWidths = ref({
  name: 200,
  value: 100,
  state: 100,
  ack: 100,
  severity: 100,
  timestamp: 200
})

const isResizing = ref(false)
const currentResizer = ref(null)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (e, column) => {
  isResizing.value = true
  currentResizer.value = column
  startX.value = e.pageX
  startWidth.value = columnWidths.value[column]
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResize)
}

const handleMouseMove = (e) => {
  if (!isResizing.value) return
  const diff = e.pageX - startX.value
  columnWidths.value[currentResizer.value] = Math.max(50, startWidth.value + diff)
}

const stopResize = () => {
  isResizing.value = false
  currentResizer.value = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
}

const sortedAlarms = computed(() => {
  const entries = Object.entries(alms.value)
  return entries.sort((a, b) => {
    let valueA = a[1][sortField.value]
    let valueB = b[1][sortField.value]

    // Special handling for timestamp
    if (sortField.value === 'timestamp') {
      valueA = new Date(valueA)
      valueB = new Date(valueB)
    }

    if (valueA < valueB) return sortDirection.value === 'asc' ? -1 : 1
    if (valueA > valueB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

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

const router = useRouter()
const username = ref('')

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
        // console.log("name: ", name," value: ", value," timestamp: ", timestamp)

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
        let timestamp = event.data.almSubscribe.timestamp

        // If alarm is reset and acknowledged, and newer than existing one, remove it from the dictionary
        if (event.data.almSubscribe.state === 'Reset' &&
            event.data.almSubscribe.ack === 'Ack' &&
            (!alms.value[name] || new Date(timestamp) > new Date(alms.value[name].timestamp))) {
          const { [name]: removed, ...rest } = alms.value
          alms.value = rest
          console.log("alms 1: ", alms.value)
          console.log("new alms: ", event.data.almSubscribe)
          continue
        }

        // Update alarm only if it's new or has a newer timestamp
        if (!alms.value[name] || new Date(timestamp) > new Date(alms.value[name].timestamp)) {
          alms.value = {
            ...alms.value,
            [name]: event.data.almSubscribe
          }
        }
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
  alms.value = {}
}

const acknowledgeAlarm = async (almName) => {
  try {
    const accessToken = await authService.getAccessToken();
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    const result = await request({
      url: 'https://api.scada.mzaniolo.net/',
      document: ALM_ACK,
      variables: {
        almName: almName
      },
      requestHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    // console.log('Alarm acknowledged:', result);
  } catch (error) {
    console.error('Error acknowledging alarm:', error);
  }
}

// Initialize when component is mounted
onMounted(async () => {
  initializeWebSocket()
  // Get username from auth service
  try {
    const profile = await authService.getProfile()
    username.value = profile?.name || 'User'
  } catch (error) {
    console.error('Error fetching profile:', error)
    username.value = 'User'
  }
})

const handleLogout = async () => {
  try {
    await authService.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<template>
  <div id="grid_container">
    <header>
      <div class="header-content">
        <h1>Demo Substation</h1>
        <div class="user-section">
          <span class="username">{{ username }}</span>
          <button @click="handleLogout" class="logout-button">Logout</button>
        </div>
      </div>
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
        <h3>Last alarms</h3>
        <button @click="clearAlarms" class="clear-button">Clear Alarms</button>
      </div>
      <div class="alarms-list">
        <div class="alarm-header">
          <div class="header-cell" :style="{ width: columnWidths.name + 'px' }">
            <span @click="sortBy('name')" class="alarm-field sortable" :data-sort="sortField === 'name' ? sortDirection : null">Name</span>
            <div class="resize-handle" @mousedown="(e) => startResize(e, 'name')"></div>
          </div>
          <div class="header-cell" :style="{ width: columnWidths.value + 'px' }">
            <span @click="sortBy('value')" class="alarm-field sortable" :data-sort="sortField === 'value' ? sortDirection : null">Value</span>
            <div class="resize-handle" @mousedown="(e) => startResize(e, 'value')"></div>
          </div>
          <div class="header-cell" :style="{ width: columnWidths.state + 'px' }">
            <span @click="sortBy('state')" class="alarm-field sortable" :data-sort="sortField === 'state' ? sortDirection : null">State</span>
            <div class="resize-handle" @mousedown="(e) => startResize(e, 'state')"></div>
          </div>
          <div class="header-cell" :style="{ width: columnWidths.ack + 'px' }">
            <span @click="sortBy('ack')" class="alarm-field sortable" :data-sort="sortField === 'ack' ? sortDirection : null">Ack</span>
            <div class="resize-handle" @mousedown="(e) => startResize(e, 'ack')"></div>
          </div>
          <div class="header-cell" :style="{ width: columnWidths.severity + 'px' }">
            <span @click="sortBy('severity')" class="alarm-field sortable" :data-sort="sortField === 'severity' ? sortDirection : null">Severity</span>
            <div class="resize-handle" @mousedown="(e) => startResize(e, 'severity')"></div>
          </div>
          <div class="header-cell" :style="{ width: columnWidths.timestamp + 'px' }">
            <span @click="sortBy('timestamp')" class="alarm-field sortable" :data-sort="sortField === 'timestamp' ? sortDirection : null">Timestamp</span>
            <div class="resize-handle" @mousedown="(e) => startResize(e, 'timestamp')"></div>
          </div>
        </div>
        <li v-for="(item, name) in sortedAlarms"
            @click="acknowledgeAlarm(item[1].name)"
            :class="{ 'acknowledged': item[1].ack }"
            class="alarm-item">
          <div class="alarm-cell" :style="{ width: columnWidths.name + 'px' }">{{ item[1].name }}</div>
          <div class="alarm-cell" :style="{ width: columnWidths.value + 'px' }">{{ item[1].value }}</div>
          <div class="alarm-cell" :style="{ width: columnWidths.state + 'px' }">{{ item[1].state }}</div>
          <div class="alarm-cell" :style="{ width: columnWidths.ack + 'px' }">{{ item[1].ack }}</div>
          <div class="alarm-cell" :style="{ width: columnWidths.severity + 'px' }">{{ item[1].severity }}</div>
          <div class="alarm-cell" :style="{ width: columnWidths.timestamp + 'px' }">{{ item[1].timestamp }}</div>
        </li>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --on: rgb(80,80,80);
  --off: rgb(28, 28, 28);
  --off-brd: rgb(61,61,61);
  --sec-on: rgb(35,35,35);
  --header-bg: rgb(25, 25, 25);
  --page-bg: rgb(70, 70, 70);
  --alarm-bg: rgb(45, 45, 45);
  --alarm-hover: rgb(55, 55, 55);

  --line-on: rgb(69, 71, 53);
  --line-off: rgb(41, 41, 41);

  --background: rgb(30, 30, 30);

  --scale: min(2.5vw, 2.5vh);
  --main-width: calc(var(--scale) * 20);
  --main-height: calc(var(--scale) * 30);
  --brk-h: calc(var(--scale)*3);
  --sec-h: calc(var(--scale)*3);
  --brk-w: var(--scale);
  --sec-w: var(--scale);
}

/* Reset default margins and ensure dark background */
:root, body {
  margin: 0;
  padding: 0;
  background-color: var(--page-bg);
  min-height: 100vh;
  overflow-x: hidden;
}

#grid_container{
  display: grid;
  width: 100%;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    "header header"
    "main alarm "
    "main alarm";
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  align-items: start;
}

main{
  background-color: var(--background);
  margin-top: 10px;
  height: var(--main-height);
  width: var(--main-width);
  position: relative;
  grid-area: main;
  justify-self: start;
  padding: 15px;
  margin-left: 20px;
  min-width: 300px;
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

#alarms {
  grid-area: alarm;
  font-size: small;
  justify-self: start;
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: var(--main-height);
  max-height: var(--main-height);
  overflow: hidden;
  min-width: 300px;
  margin-left: 20px;
  background-color: var(--background);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

#src{
  top: 1.6%;
  left: 37.5%;
  height: calc(var(--scale)*1.5);
  width: var(--brk-w);
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
  width: var(--brk-w);
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
  width: 100%;
  background-color: var(--header-bg);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.header-content h1 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: #e0e0e0;
  font-size: 1rem;
}

.logout-button {
  padding: 0.5rem 1rem;
  background-color: var(--on);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: var(--line-on);
}

.alarms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.alarms-header h3 {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alarms-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--off-brd);
  border-radius: 4px;
  padding: 8px;
  min-height: 0;
  background-color: var(--alarm-bg);
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

.alarm-item {
  cursor: pointer;
  padding: 4px;
  margin: 2px 0;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  gap: 0;
  align-items: center;
  color: #ffffff;
  background-color: var(--alarm-bg);
}

.alarm-item:hover {
  background-color: var(--alarm-hover);
}

.alarm-item.acknowledged {
  opacity: 0.6;
  color: #a0a0a0;
}

.alarm-field {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-header {
  display: flex;
  gap: 0;
  padding: 8px 4px;
  font-weight: bold;
  border-bottom: 2px solid var(--line-on);
  margin-bottom: 8px;
  position: sticky;
  top: 0;
  background-color: var(--alarm-bg);
  z-index: 1;
  color: #ffffff;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.header-cell {
  position: relative;
  padding-right: 16px;
}

.alarm-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 16px;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background-color: var(--line-on);
}

/* Add cursor style when resizing */
body.resizing {
  cursor: col-resize;
  user-select: none;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 16px;
  transition: color 0.2s;
  color: #ffffff;
  font-weight: 600;
}

.sortable:hover {
  color: #ffffff;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
}

.sortable::after {
  content: '↕';
  position: absolute;
  right: 0;
  opacity: 0.9;
  color: #ffffff;
  font-weight: normal;
}

.sortable[data-sort="asc"]::after {
  content: '↑';
  opacity: 1;
  color: #ffffff;
}

.sortable[data-sort="desc"]::after {
  content: '↓';
  opacity: 1;
  color: #ffffff;
}
</style>
