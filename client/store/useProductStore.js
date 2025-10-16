import { create } from 'zustand';
import axios from 'axios';
axios.defaults.withCredentials = true;
const BASE_URL = "http://localhost:2500/api/products";
export const useProductStore = create((set, get) => ({
    products: [],
    loading: false,
    error: null,
    fetchProducts: async () => {
        set({ loading: true });
        try {
            const response = await axios.get(BASE_URL);
            set({
                error: null,
                products: response.data.data,
            });
        } catch (error) {
            console.error(error.message);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    deleteProduct: async (productId) => {
        set({ loading: true });
        try {
            await axios.delete(`${BASE_URL}/${productId}`);
            const updatedProducts = get().products.filter(p => p.id !== productId);
            set({ products: updatedProducts, error: null });
        } catch (error) {
            console.error(error.message);
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
}));