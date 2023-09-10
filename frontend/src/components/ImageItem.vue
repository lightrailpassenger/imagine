<script setup>
defineProps(["id", "name"]);
</script>

<template>
    <div class="item">
        <span class="name">{{ name }}</span>
        <button @click.prevent="">View</button>
    </div>
</template>

<style scoped>
.item {
    width: 100%;
    max-width: 680px;
    display: flex;
    font-size: 20px;
    background: white;
    margin-top: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    min-height: 30px;
    line-height: 30px;
}

.name {
    flex: 1 1 auto;
    padding-left: 10px;
}

button {
    background: transparent;
    border: 1px solid black;
    border-radius: 2px;
    font-size: 18px;
    margin: 3px;
}
</style>
