<script setup>
import { ref, computed, toRaw, onMounted, onUnmounted, watch } from "vue";

const { credentialsHeader, imageId } = defineProps({
    credentialsHeader: {
        type: Object,
        required: true,
    },
    imageId: {
        type: String,
        required: true,
    },
});
defineEmits(["close"]);

const dialog = ref();
const showModal = () => {
    dialog.value.showModal();
};
const close = () => {
    dialog.value.close();
};

const links = ref([]);
const hasLink = computed(() => links.value.length > 0);
const fetchShareLinks = async (fetchingImageId, signal) => {
    const res = await fetch(
        `${
            import.meta.env.VITE_ENDPOINT_BASE_URL
        }/user-images/${encodeURIComponent(imageId)}/share-links`,
        {
            method: "get",
            headers: toRaw(credentialsHeader),
            signal,
        }
    );

    if (res.ok) {
        const { info } = await res.json();
        links.value = info.map(({ token, used, total }) => ({
            used,
            total,
            url: `${
                new URL(window.location.href).origin
            }/guest/${encodeURIComponent(token)}`,
        }));
    } else {
        // TODO: Error state
    }
};
const ac = ref(new AbortController());

onMounted(() => {
    fetchShareLinks(imageId, ac.value.signal);
});
onUnmounted(() => {
    ac.value.abort();
});

watch(
    () => imageId,
    () => {
        ac.value.abort();
        ac.value = new AbortController();
        fetchShareLinks(imageId, ac.value.signal);
    }
);

defineExpose({
    showModal,
    close,
    fetchShareLinks,
});
</script>

<template>
    <dialog ref="dialog" @close="$emit('close', $event)">
        <div class="main">
            <p class="title">Existing share links:</p>
            <ul v-if="hasLink">
                <li v-for="link in links" :key="link.url">
                    <span class="url">
                        {{ link.url }}
                    </span>
                    <span class="usage">
                        {{ `${link.used} / ${link.total}` }}
                    </span>
                </li>
            </ul>
            <div v-else class="no-link-created-div">
                <span>This image hasn't been shared.</span>
            </div>
            <button class="close-button" type="button" @click.prevent="close">
                Close
            </button>
        </div>
    </dialog>
</template>

<style scoped>
dialog {
    height: 80vh;
}

.main {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.no-link-created-div {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

ul {
    margin: 10px;
    flex: 1 1 0;
    overflow: auto;
}

li {
    display: flex;
    flex-direction: row;
    margin: 5px 0;
}

.url {
    flex: 1 1 0;
    max-width: calc(min(480px, 80vw));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 10px;
}

.usage {
    flex: 0 0 auto;
    width: 50px;
}

.title {
    font-size: 25px;
    margin-top: 0;
    flex: 0 0 auto;
}

.close-button {
    align-self: flex-end;
    border: 1px solid black;
    background: transparent;
    border-radius: 2px;
}
</style>
