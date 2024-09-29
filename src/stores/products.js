import { defineStore } from "pinia";

export const useProductsStore = defineStore('productsStore', {
    state: () => {
        return {
            errors: {},
        }
    },
    getters: {},
    actions: {
        //GET ALL PRODUCTS
        async getProducts() {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
    
                if(res.ok) {
                    return data;
                }
            } catch(error) {
                console.error("Couldn't load products", error);
            }
           
        },

        //ADD PRODUCT
        async addProduct(formData) {
            try {
                const res = await fetch('/api/products', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                });

                const data = await res.json();
                console.log(data);
            } catch (error) {
                console.error('Unable to add product right now', error);
            }
           
        },

        //DELETE PRODUCT
        async deleteProduct(productId) {
            try {
                const res = await fetch(`/api/products/${productId}`, {
                    method: 'DELETE',
                });
            } catch (error) {
                console.error(error);
            }
          
        },

        //UPDATE PRODUCT
        async updateProduct(productId, formData) {
            try {
                const res = await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData),
                });
            } catch(error) {
                console.error(error);
            }
           
        }
    }
})