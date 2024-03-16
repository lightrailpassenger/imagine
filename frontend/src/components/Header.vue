<script setup>
import { useRouter } from "vue-router";

defineEmits(["logout", "upload"]);
defineProps({
    shouldShowUpload: {
        type: Boolean,
        required: false,
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
        <div class="space" />
        <button v-if="shouldShowUpload" @click="$emit('upload', $event)">
            Upload
        </button>
        <button class="logout" @click="$emit('logout', $event)">Log out</button>
    </div>
</template>

<style scoped>
.title-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-width: 680px;
    align-items: center;
}

a {
    margin-left: 5px;
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
    flex: 1 1 400px;
}

button {
    flex: 0 0 auto;
    background: transparent;
    border: 1px solid black;
    font-size: 18px;
    border-radius: 2px;
    margin-left: 3px;
}

button.logout {
    margin-right: 5px;
}
</style>
