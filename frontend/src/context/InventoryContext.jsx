import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () => {
    try {
      console.log("Fetching latest inventory data...");
      const [invRes, demandRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/inventory"),
        fetch("http://127.0.0.1:8000/demand-analytics"),
      ]);

      const invResult = await invRes.json();
      const demandResult = await demandRes.json();

      if (invResult.status === "failed") {
        console.error("Backend error fetching inventory:", invResult.error);
        return;
      }

      // Build demand lookup map: product_id → { avg_demand, predicted_demand }
      const demandMap = {};
      (demandResult.data || []).forEach((d) => {
        demandMap[d.product_id] = {
          avgDemand: d.avg_demand || 10,
          predictedDemand: d.predicted_demand || 0,
        };
      });

      const mappedData = (invResult.data || []).map(item => {
        const pid = item.product_id || item.id;
        const demandInfo = demandMap[pid] || {};
        return {
          ...item,
          id: pid,
          name: item.product_name || item.name || 'Unknown Product',
          stock: parseInt(item.stock, 10) || 0,
          price: parseFloat(item.price) || 0,
          reorderPoint: item.reorderPoint || 20,
          avgDemand: demandInfo.avgDemand || 10,           // Real historical avg
          predictedDemand: demandInfo.predictedDemand || 0, // ML forecast
          leadTimeDays: item.leadTimeDays || 5,
        };
      });

      setInventory(mappedData);
      console.log("Inventory state hydrated with", mappedData.length, "items.");
    } catch (err) {
      console.error("Failed to fetch inventory from backend:", err);
    }
  };

  useEffect(() => {
    // 1. Initial Fetch on Mount
    fetchInventory();

    // 2. Real-time Supabase Subscription
    console.log("Initializing Supabase realtime subscription for 'inventory' table...");
    const channel = supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
        console.log('Real-time database payload received:', payload);
        // Automatically refresh UI on any INSERT, UPDATE, or DELETE
        fetchInventory();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription to inventory table is active.');
        } else if (status === 'CLOSED') {
          console.log('🔴 Real-time subscription closed.');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error.');
        }
      });

    // 3. Cleanup Subscription on Unmount
    return () => {
      console.log("Cleaning up realtime subscription...");
      supabase.removeChannel(channel);
    };
  }, []);

  const orderItem = async (product_id, quantity) => {
    try {
      console.log(`Action: Remove Stock for Product ${product_id}, Quantity: ${quantity}`);
      const res = await fetch("http://127.0.0.1:8000/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity }),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
          alert(`✅ Successfully removed ${quantity} stock!`);
          console.log("Update Success:", data);
      } else {
          alert(`⚠️ Failed to remove stock: ${data.error}`);
          console.error("Update Failed:", data.error);
      }
      
      // Refresh inventory to assure our component state captures changes tightly explicitly
      await fetchInventory();
    } catch (error) {
      alert("❌ Critical Error: Could not connect to the backend API.");
      console.error("Async Error in orderItem:", error);
    }
  };

  const restockItem = async (product_id, quantity) => {
    try {
      console.log(`Action: Restock Product ${product_id}, Quantity: ${quantity}`);
      const res = await fetch("http://127.0.0.1:8000/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity }),
      });
      const data = await res.json();

      if (data.status === 'success') {
          alert(`✅ Successfully restocked ${quantity} units!`);
          console.log("Restock Success:", data);
      } else {
          alert(`⚠️ Failed to restock: ${data.error}`);
          console.error("Restock Failed:", data.error);
      }

      await fetchInventory();
    } catch (error) {
      alert("❌ Critical Error: Could not connect to the backend API.");
      console.error("Async Error in restockItem:", error);
    }
  };

  const addProduct = async (product) => {
    try {
      console.log(`Action: Add Product:`, product);
      const res = await fetch("http://127.0.0.1:8000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        alert(`✅ Successfully added product: ${product.product_name}`);
        console.log("Add Product Success");
      } else {
        alert(`⚠️ Failed to add product: ${data.error}`);
        console.error("Add Product Failed:", data.error);
      }

      await fetchInventory();
    } catch (error) {
      alert("❌ Critical Error: Could not connect to the backend API.");
      console.error("Async Error in addProduct:", error);
    }
  };

  const deleteItem = async (product_id) => {
    try {
      console.log(`Action: Delete Product ${product_id}`);
      const res = await fetch(`http://127.0.0.1:8000/delete-product/${product_id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.status === 'success') {
          alert(`✅ Successfully deleted out product completely.`);
          console.log("Delete Success");
      } else {
          alert(`⚠️ Failed to delete product: ${data.error}`);
          console.error("Delete Failed:", data.error);
      }

      await fetchInventory();
    } catch (error) {
      alert("❌ Critical Error: Could not connect to the backend API.");
      console.error("Async Error in deleteItem:", error);
    }
  };

  return (
    <InventoryContext.Provider value={{ inventory, restockItem, orderItem, addProduct, deleteItem, fetchInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};
