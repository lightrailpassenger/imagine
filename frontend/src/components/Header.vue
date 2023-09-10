<script setup>
defineEmits(["logout", "upload"]);
defineProps(["shouldShowUpload"]);
</script>

<template>
    <div class="title-container">
        <h1>Imagine</h1>
        <span class="space" />
        <button v-if="shouldShowUpload" @click="$emit('upload', $event)">
            Upload
        </button>
        <button @click="$emit('logout', $event)">Log out</button>
    </div>
</template>

<style scoped>
.title-container {
    display: flex;
    flex-direction: row;
    width: 680px;
    align-items: center;
}

h1 {
    flex: 0 0 auto;
    font-size: 40px;
}

.space {
    flex: 1 1 0;
}

button {
    flex: 0 0 auto;
    background: transparent;
    border: 1px solid black;
    font-size: 18px;
    border-radius: 2px;
    margin-left: 3px;
}
</style>
