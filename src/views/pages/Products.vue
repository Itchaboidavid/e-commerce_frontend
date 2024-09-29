<script setup>
import { useCategoriesStore } from '@/stores/categories';
import { useProductsStore } from '@/stores/products';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const { getProducts } = useProductsStore();
const { addProduct } = useProductsStore();
const { deleteProduct } = useProductsStore();
const { updateProduct } = useProductsStore();
const { getCategories } = useCategoriesStore();

const products = ref([]);
const categories = ref([]);
const selectedFile = ref(null); // Add ref for the selected file

onMounted(async () => {
    const [fetchedProducts, fetchedCategories] = await Promise.all([getProducts(), getCategories()]);
    products.value = fetchedProducts;
    categories.value = fetchedCategories;
});

const toast = useToast();
const dt = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);

function formatCurrency(value) {
    if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    return;
}

function openNew() {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
}

function hideDialog() {
    productDialog.value = false;
    submitted.value = false;
}

function onImageSelected(event) {
    selectedFile.value = event.target.files[0]; // Capture the selected file
}

function saveProduct() {
    submitted.value = true;
    if (product?.value.name?.trim()) {
        if (product.value.id) {
            updateProduct(product.value.id, product.value)
                .then(() => {
                    return getProducts(); // Retrieve latest products after update
                })
                .then((latestProducts) => {
                    products.value = latestProducts; // Update the products array
                    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
                })
        } else {
            // Call the addProduct function and await its completion
            addProduct(product.value)
                .then(() => {
                    return getProducts();
                })
                .then((latestProducts) => {
                    products.value = latestProducts;
                    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
                });
        }

        productDialog.value = false;
        product.value = {};
    }
}

function editProduct(prod) {
    product.value = { ...prod };
    productDialog.value = true;
}

function confirmDeleteProduct(prod) {
    product.value = prod;
    deleteProductDialog.value = true;
}

function deleteProductVue() {
    deleteProduct(product.value.id)
        .then(() => {
            return getProducts();
        })
        .then((latestProducts) => {
            products.value = latestProducts;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
        });
    deleteProductDialog.value = false;
    product.value = {};
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteProductsDialog.value = true;
}

async function deleteSelectedProducts() {
    for (const prod of selectedProducts.value) {
        await deleteProduct(prod.id);
    }
    products.value = await getProducts();
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
}
</script>

<template>
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected"
                        :disabled="!selectedProducts || !selectedProducts.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable ref="dt" v-model:selection="selectedProducts" :value="products" dataKey="id" :paginator="true"
                :rows="10" :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Products</h4>
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
                <Column field="price" header="Price" sortable style="min-width: 8rem">
                    <template #body="slotProps">
                        {{ formatCurrency(slotProps.data.price) }}
                    </template>
                </Column>
                <Column field="quantity" header="Quantity" sortable style="min-width: 10rem"></Column>
                <Column field="category.name" header="Category" sortable style="min-width: 10rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2"
                            @click="editProduct(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger"
                            @click="confirmDeleteProduct(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="productDialog" :style="{ width: '450px' }" header="Product Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="image" class="block font-bold mb-3">Product Image</label>
                    <input type="file" id="image" accept="image/*" @change="onImageSelected" />
                    <small class="text-gray-500">Upload an image for the product (optional).</small>
                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="product.name" required="true" autofocus
                        :invalid="submitted && !product.name" fluid />
                    <small v-if="submitted && !product.name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <Textarea id="description" v-model="product.description" required="true" rows="3" cols="20" fluid />
                </div>
                <div>
                    <span class="block font-bold mb-4">Category</span>
                    <div v-if="categories" class="grid grid-cols-12 gap-4">
                        <div v-for="category in categories" :key="category.id"
                            class="flex items-center gap-2 col-span-6">
                            <RadioButton id="category" v-model="product.category_id" name="category"
                                :value="category.id" />
                            <label for="category">{{ category.name }}</label>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="price" class="block font-bold mb-3">Price</label>
                        <InputNumber id="price" v-model="product.price" mode="currency" currency="USD" locale="en-US"
                            fluid />
                    </div>
                    <div class="col-span-6">
                        <label for="quantity" class="block font-bold mb-3">Quantity</label>
                        <InputNumber id="quantity" v-model="product.quantity" integeronly fluid />
                    </div>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveProduct" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete <b>{{ product.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteProductVue" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="product">Are you sure you want to delete the selected products?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
            </template>
        </Dialog>
    </div>
</template>
