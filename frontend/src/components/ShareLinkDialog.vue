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

const deleteShareLinkDialog = ref();
const onDeleteShareLinkDialogShow = () => {
    deleteShareLinkDialog.value.showModal();
};
const onDeleteShareLinkDialogClose = () => {
    deleteShareLinkDialog.value.close();
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
            token,
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

const selectedMap = ref(new Map());
const isChecked = (token) => {
    return Boolean(selectedMap.value.get(token));
};
const toggle = (token) => {
    const old = selectedMap.value.get(token);
    selectedMap.value.set(token, !old);
};
const isAtLeastOneChecked = computed(() => {
    const validTokens = new Set(links.value.map((link) => link.token));

    for (let [token, checked] of selectedMap.value) {
        if (checked && validTokens.has(token)) {
            return true;
        }
    }

    return false;
});
const isDeleting = ref(false);
const deleteShareLinks = async () => {
    // TODO: Batch API?
    isDeleting.value = true;

    try {
        const validTokens = new Set(links.value.map((link) => link.token));

        for (const [token, checked] of selectedMap.value) {
            if (checked && validTokens.has(token)) {
                await fetch(
                    `${
                        import.meta.env.VITE_ENDPOINT_BASE_URL
                    }/user-images/share-link/${encodeURIComponent(token)}`,
                    {
                        headers: toRaw(credentialsHeader),
                        method: "delete",
                    }
                );

                // TODO: Error state?
            }
        }

        deleteShareLinkDialog.value.close();
        await fetchShareLinks();
    } finally {
        isDeleting.value = false;
    }
};

defineExpose({
    showModal,
    close,
    fetchShareLinks,
});
</script>

<template>
    <dialog ref="dialog" class="main-dialog" @close="$emit('close', $event)">
        <div class="main">
            <p class="title">Existing share links:</p>
            <ul v-if="hasLink">
                <li v-for="link in links" :key="link.url">
                    <input
                        type="checkbox"
                        :checked="isChecked(link.token)"
                        @click="toggle(link.token)"
                    />
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
            <div class="close-button">
                <dialog ref="deleteShareLinkDialog">
                    Delete share links?
                    <button
                        class="small-button"
                        type="button"
                        :disabled="isDeleting"
                        @click.prevent="onDeleteShareLinkDialogClose"
                    >
                        No
                    </button>
                    <button
                        class="small-button"
                        type="button"
                        :disabled="isDeleting"
                        @click.prevent="deleteShareLinks"
                    >
                        Yes
                    </button>
                </dialog>
                <button
                    type="button"
                    :disabled="!isAtLeastOneChecked"
                    @click.prevent="onDeleteShareLinkDialogShow"
                >
                    Delete
                </button>
                <button type="button" @click.prevent="close">Close</button>
            </div>
        </div>
    </dialog>
</template>

<style scoped>
.main-dialog {
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

input[type="checkbox"] {
    margin-right: 6px;
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
}

.small-button,
.close-button > button {
    margin-left: 3px;
    border: 1px solid black;
    background: transparent;
    border-radius: 2px;
}
</style>
