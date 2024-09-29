<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

onMounted(async () => await authStore.getUser());

let model = computed(() => {
    if (authStore.user.role === 'admin') {
        return [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
            },
            {
                label: 'Deliverables',
                items: [
                    { label: 'Products', icon: 'pi pi-fw pi-shopping-bag', to: '/products' },
                    { label: 'Categories', icon: 'pi pi-fw pi-sitemap', to: '/categories' },
                ]
            },
        ];
    } else {
        return [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
            },
            {
                label: 'Deliverables',
                items: [
                    { label: 'Products', icon: 'pi pi-fw pi-shopping-bag', to: '/products/list' },
                    { label: 'Orders', icon: 'pi pi-fw pi-truck', to: '/products' },
                ]
            },
        ];
    }
});


</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
