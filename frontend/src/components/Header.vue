<script setup>
import { useRouter } from "vue-router";

defineEmits(["logout", "upload"]);
defineProps({
    shouldShowUpload: {
        type: Number,
        required: true,
    },
});

const $router = useRouter();
const onVisitList = () => {
    $router.push({
        path: "/list",
    });
};
</script>

<template>
    <div class="title-container">
        <a href="/list" @click.prevent="onVisitList">Imagine</a>
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

a {
    flex: 0 0 auto;
    font-size: 40px;
    color: black;
}

a:hover,
a:visited,
a:active,
a:link {
    text-decoration: none;
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
