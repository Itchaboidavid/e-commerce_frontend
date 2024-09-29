<script setup>
import { useCategoriesStore } from '@/stores/categories';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const { getCategories } = useCategoriesStore();
const { addCategory } = useCategoriesStore();
const { deleteCategory } = useCategoriesStore();
const { updateCategory } = useCategoriesStore();

const categories = ref([]);

onMounted(async () => categories.value = await getCategories());

const toast = useToast();
const dt = ref();
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const deleteCategoriesDialog = ref(false);
const category = ref({});
const selectedCategories = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

function openNew() {
    category.value = {};
    submitted.value = false;
    categoryDialog.value = true;
}

function hideDialog() {
    categoryDialog.value = false;
    submitted.value = false;
}

function saveCategory() {
    submitted.value = true;

    if (category?.value.name?.trim()) {
        if (category.value.id) {
            updateCategory(category.value.id, category.value)
                .then(() => {
                    return getCategories(); //Retrieve latest categories
                })
                .then((latestCategories) => {
                    categories.value = latestCategories; // Update the products array
                    toast.add({ severity: 'success', summary: 'Successful', detail: 'Category Updated', life: 3000 });
                })
        } else {
            // Call the addCategory function and await its completion
            addCategory(category.value)
                .then(() => {
                    return getCategories();
                })
                .then((latestCategories) => {
                    categories.value = latestCategories;
                    toast.add({ severity: 'success', summary: 'Successful', detail: 'Category Created', life: 3000 });
                });
        }

        categoryDialog.value = false;
        category.value = {};
    }
}

function editCategory(cat) {
    category.value = { ...cat };
    categoryDialog.value = true;
}

function confirmDeleteCategory(cat) {
    category.value = cat;
    deleteCategoryDialog.value = true;
}

function deleteCategoryVue() {
    deleteCategory(category.value.id)
        .then(() => {
            return getCategories();
        })
        .then((latestCategories) => {
            categories.value = latestCategories;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Category Deleted', life: 3000 });
        });
    deleteCategoryDialog.value = false;
    category.value = {};
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteCategoriesDialog.value = true;
}

async function deleteSelectedCategories() {
    for (const cat of selectedCategories.value) {
        await deleteCategory(cat.id);
    }
    categories.value = await getCategories();
    deleteCategoriesDialog.value = false;
    selectedCategories.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Categories Deleted', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                        :disabled="!selectedCategories || !selectedCategories.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable ref="dt" v-model:selection="selectedCategories" :value="categories" dataKey="id"
                :paginator="true" :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Categories</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                <Column field="description" header="Description" sortable style="min-width: 10rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                            @click="editCategory(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteCategory(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="categoryDialog" :style="{ width: '450px' }" header="Category Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="category.name" required="true" autofocus
                        :invalid="submitted && !category.name" fluid />
                    <small v-if="submitted && !category.name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="category.description" required="true" rows="3" cols="20"
                        fluid />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveCategory" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCategoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="category">Are you sure you want to delete <b>{{ category.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCategoryDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteCategoryVue" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteCategoriesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="category">Are you sure you want to delete the selected categories?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteCategoriesDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedCategories" />
            </template>
        </Dialog>
    </div>
</template>
