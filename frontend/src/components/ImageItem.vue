<script setup>
import { useRouter } from "vue-router";

const { id } = defineProps({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});

const $router = useRouter();

const onView = () => {
    $router.push({ path: `/view/${encodeURIComponent(id)}` });
};
</script>

<template>
    <div class="item">
        <span class="name">{{ name }}</span>
        <button @click.prevent="onView">View</button>
    </div>
</template>

<style scoped>
.item {
    width: 100%;
    max-width: 580px;
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
    overflow: hidden;
    text-overflow: ellipsis;
}

button {
    background: transparent;
    border: 1px solid black;
    border-radius: 2px;
    font-size: 18px;
    margin: 3px;
}
</style>
