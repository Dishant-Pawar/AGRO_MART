import { createContext, useState, useEffect } from "react";

export const OrderContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders?limit=10&sort=desc`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setOrders([]);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateOrderStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await res.json();

            if (result.modifiedCount > 0) {
                await fetchOrders();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error updating status:", error);
            return false;
        }
    };

    return (
        <OrderContext.Provider value={{ orders, fetchOrders, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
};

export default OrderProvider;
