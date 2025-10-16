import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
axios.defaults.withCredentials = true;
const BASE_URL = import.meta.env.NODE_ENV !== "development" ? "/api/products" : "http://localhost:2500/api/products";
export const useProductStore = create((set, get) => ({
    products: [],
    currentProduct: null,
    formData: { name: "", price: "", image: "" },
    loading: false,
    error: null,
    fetchProducts: async () => {
        set({ loading: true });
        try {
            const response = await axios.get(BASE_URL);
            set({ products: response.data.data, error: null });
        } catch (error) {
            console.error(error.message);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    fetchProduct: async (id) => {
        set({ loading: true });
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            set({
                currentProduct: response.data.product,
                formData: {
                    name: response.data.product.name,
                    price: response.data.product.price,
                    image: response.data.product.image
                },
                error: null
            });
        } catch (error) {
            console.error(error.message);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    addProduct: async (name, price, image) => {
        set({ loading: true });
        try {
            await axios.post(BASE_URL, { name, price, image });
            await get().fetchProducts();
            document.getElementById('add_product_modal')?.close();
            toast.success('Product created successfully!');
        } catch (error) {
            console.error(error.message);
            set({ error: error.message });
            toast.error('Failed to create product!');
        } finally {
            set({ loading: false });
        }
    },
    updateProduct: async (id) => {
        const { formData } = get();
        set({ loading: true });
        try {
            await axios.put(`${BASE_URL}/${id}`, formData);
            await get().fetchProducts(); // refresh product list
            toast.success('Product updated successfully!');
        } catch (error) {
            console.error(error.message);
            set({ error: error.message });
            toast.error('Failed to update product!');
        } finally {
            set({ loading: false });
        }
    },
    deleteProduct: async (id) => {
        set({ loading: true });
        try {
            await axios.delete(`${BASE_URL}/${id}`);
            set({ products: get().products.filter(p => p.id !== id), error: null });
            toast.success('Product deleted successfully!');
        } catch (error) {
            console.error(error.message);
            set({ error: error.message });
            toast.error('Failed to delete product!');
        } finally {
            set({ loading: false });
        }
    },
    setFormData: (data) => set({ formData: data }),
}));
