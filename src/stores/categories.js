import { defineStore } from "pinia";

export const useCategoriesStore = defineStore('categoriesStore', {
    state: () => {
        return {

        }
    },
    getters: {},
    actions: {
        //GET ALL CATEGORIES
        async getCategories() {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                
                if(res.ok) {
                    return data;
                }
                
            } catch (error) {
                console.error('We encounter a problem fetching categories', error);
            }
        },

        //ADD CATEGORY
        async addCategory(formData) {
            try {
                const res = await fetch('/api/categories', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            } catch (error) {
                console.error('Failed to add category', error);
            }
        },

        //EDIT CATEGORY
        async updateCategory(categoryId, formData) {
            try {
                const res = await fetch(`/api/categories/${categoryId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } catch (error) {
                console.error('We encounter an error updating the category.', error);
            }
          
        },

        //DELETE CATEGORY
        async deleteCategory(categoryId) {
            try {
                const res = await fetch(`/api/categories/${categoryId}`, {
                    method: 'DELETE',
                });
            } catch (error) {
                console.error('Delete category failed.', error);
            }
           
        }
    }
});