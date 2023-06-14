<script setup>
import Loadding from '../components/Loadding.vue'
import { ref, onMounted } from 'vue'

const emit = defineEmits(['posted'])
const labels =  ref()

onMounted(async ()=>{
    let resp = await fetch('https://api.lowlevelnews.com/o/labels')
    if(resp.headers.get("X-Session-Valid") == "false") {
        emit("sessionExpired")
    }
    labels.value = await resp.json()
})
</script>
<template>
    <div class="sidelabels">
        <div v-if="labels">
            <h2>热点</h2>
            <ul>
                <li v-for="label in labels">
                    <div class="label">#{{ label.value }}</div>
                    <div class="count">{{ label.count }}</div>
                </li>
            </ul>
        </div>
        <Loadding v-if="!labels" />
    </div>
</template>
<style scoped>
.sidelabels {
    width: 300px;
    border: 1px solid rgb(239, 243, 244);
    border-radius: 16px;
    padding: 0 0 16px 0;
    background-color: rgb(247, 249, 249);
    margin-top: 20px;
}

.sidelabels li {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
}
.sidelabels li:hover {
    background-color: rgba(0,0,0,0.04);
    cursor: pointer;
    transition: 0.4s;
}
.sidelabels .label {
    font-weight: bold;
    font-size: 15px;
}
.sidelabels .count {
    font-size: 14px;
    color: #666;
}
h2 {
    padding: 6px 15px;
    font-size: 20px;
    font-weight: bold;
    color: #000;
}
</style>