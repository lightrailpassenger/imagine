<script setup>
import Login from "../components/Login.vue";

defineOptions({
    inheritAttrs: false,
});
</script>

<template>
    <main>
        <Login v-bind="$attrs" />
    </main>
</template>
