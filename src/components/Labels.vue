<template>
    <div class="sidelabels">
        <h2>热点</h2>
        <ul>
            <li>
                <div class="label">#AI</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#Bitcoin</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#AI</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#Bitcoin</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#AI</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#Bitcoin</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#AI</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#Bitcoin</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#AI</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#Bitcoin</div>
                <div class="count">10K</div>
            </li>
            <li>
                <div class="label">#AI</div>
                <div class="count">10K</div>
            </li>
        </ul>
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
    font-size: 16px;
}
.sidelabels .count {
    font-size: 14px;
    color: #666;
}
h2 {
    padding: 6px 15px;
    font-size: 20px;
    font-weight: bold;
}
</style>