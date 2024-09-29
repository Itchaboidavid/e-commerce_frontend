import { defineStore } from "pinia";

export const useAuthStore = defineStore('authStore', {
    state: () => {
        return {
            user: null,
            errors: {}
        }
    },
    getters: {},
    actions: {
        //GET AUTHENTICATED USER
        async getUser() {
            if(localStorage.getItem('token')) {
                const res = await fetch('/api/user', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await res.json();

                if(res.ok) {
                    this.user = data;
                }
            }
        },

        //LOGIN OR REGISTER USER
        async authenticate(apiRoute, formData) {
            const res = await fetch(`/api/${apiRoute}`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            
            if(data.errors) {
                this.errors = data.errors;
                console.log(data);
            } else {
                localStorage.setItem('token', data.token);
                this.user = data.user;
                this.router.push({name: 'dashboard'});
            }
        },

        //LOGOUT
        async logout() {
            const res = await fetch('/api/logout', {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(res.ok) {
                localStorage.removeItem('token');
                // this.router.push({name: 'landing'});

                window.location.reload()
            };
        }
    }
});