<script setup>
import { watchEffect, ref, onMounted } from 'vue'

const sessionUniqueName = ref("")
const sessionPicture = ref("")
const activeClass = ref("")
const session = ref(null)
const contentRaw = ref("")
const contentFormatted = ref([])

onMounted(() => {
    let sessionStr = window.localStorage.getItem("session")
    if (sessionStr) {
        let sessionObj = JSON.parse(sessionStr)
        session.value = sessionObj
        sessionUniqueName.value = sessionObj.uniqueName
        sessionPicture.value = sessionObj.picture
    }
})

watchEffect(() => {
    if (contentRaw.value.length > 0) {
        activeClass.value = "active"
    } else {
        activeClass.value = ""
    }
})

async function newStatus() {
    if (contentRaw.value.length == 0) {
        return
    }
    const div = document.createElement('div')
    div.innerHTML = contentRaw.value
    contentFormatted.value = []
    processNode(div)
    console.log(contentFormatted.value)
    let resp = await fetch('https://api.lowlevelnews.com/i/status', {
        method: 'post',
        headers: {
            "Authorization": session.value.apiKey,
        },
        body: JSON.stringify({
            content: contentFormatted.value,
        })
    })

    if (resp.status == 200) {
        document.querySelector('.postarea .content .raw').innerHTML = ''
        contentRaw.value = ''
    } else if (resp.status == 401) {
        alert("401")
    } else {
        alert(await resp.text())
    }
}

function updateContentModel(e) {
    contentRaw.value = e.target.innerHTML
}

function handleDragEnter(e) {
    console.log(e.dataTransfer.types)
    console.log(e.dataTransfer.getData('text/plain'))
}

function paseText(e) {
    e.preventDefault()
    const text = (e.clipboardData).getData('text/plain')
    addNode(document.createTextNode(text))
}

function addNode(node) {
    const editable = document.querySelector('.postarea .content .raw')
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(node)
    } else {
        editable.appendChild(node)
    }
}

function processNode(node) {
    if (node.nodeName.toUpperCase() === 'IMG') {
        contentFormatted.value.push({ type: "img", value: node.getAttribute('src') })
        return
    }
    for (const element of node.childNodes) {
        if (element.nodeType === Node.TEXT_NODE) {
            const text = element.textContent.trim()
            if (text !== '') {
                contentFormatted.value.push({ type: "text", value: text })
            }
            continue
        }
        if (element.nodeType === Node.ELEMENT_NODE) {
            processNode(element)
        }
    }
}
</script>

<template>
    <div class="postarea">
        <div class="avatararea">
            <a class="avatar" :href="'/' + sessionUniqueName"><img :src="sessionPicture" alt="avatar" /></a>
        </div>
        <div class="content">
            <div class="raw" contenteditable="true" @dragover.prevent @drop="handleDragEnter" @paste="paseText"
                @input="updateContentModel" placeholder="有什么新鲜事？"></div>
            <div class="operate">
                <button :class="activeClass" @click="newStatus()">推送</button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.avatar,
.avatar img {
    display: inline-block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.postarea {
    display: flex;
    padding: 10px 20px;
    border-bottom: .5px solid rgb(239, 243, 244);
}

.avatararea {
    flex: 0 0 3.1rem;
}

.content {
    flex: 1;
}

.content .raw {
    width: 100%;
    min-height: 4rem;
    padding: .5rem;
    outline: none;
    border: none;
}

.content [contenteditable=true]:empty:before {
    content: attr(placeholder);
    color: #536471;
}

.content .operate {
    display: flex;
    justify-content: end;
}

.content .operate button {
    display: inline-block;
    border: none;
    background-color: hsla(160, 100%, 37%, .7);
    font-size: 15px;
    font-weight: bold;
    padding: 0.5rem 1.1rem 0.5rem 1.3rem;
    color: #fff;
    border-radius: 22px;
    letter-spacing: 0.2rem;
    transition: 0.4s;
}

.content .operate .active {
    background-color: hsla(160, 100%, 37%, 1);
    cursor: pointer;
}
</style>