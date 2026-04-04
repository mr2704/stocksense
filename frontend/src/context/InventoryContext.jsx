import React, { createContext, useContext, useState } from 'react';
import { inventoryData as initialData } from '../utils/mockData';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState(initialData);

  const restockItem = (id, amount) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, stock: item.stock + amount } : item
    ));
  };

  const addProduct = (product) => {
    setInventory(prev => [product, ...prev]);
  };

  return (
    <InventoryContext.Provider value={{ inventory, restockItem, addProduct }}>
      {children}
    </InventoryContext.Provider>
  );
};
