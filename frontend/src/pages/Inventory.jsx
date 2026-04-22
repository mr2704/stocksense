import React, { useState } from "react";
import InventoryTable from "../components/inventory/InventoryTable";
import { useInventory } from "../context/InventoryContext";

const Inventory = () => {
  const { inventory, addProduct } = useInventory();
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({
    store_id: 1,
    product_id: Math.floor(Math.random() * 10000), // Random temp ID for demo
    product_name: "",
    category: "",
    stock: 0,
    price: 0
  });

  const handleAddProduct = () => {
    // Validate
    if (!newProduct.product_name) return alert("Product name is required");
    addProduct(newProduct);
    setShowAdd(false);
    setNewProduct({
      store_id: 1,
      product_id: Math.floor(Math.random() * 10000),
      product_name: "",
      category: "",
      stock: 0,
      price: 0
    });
  };

  return (
    <div style={{ padding: "30px", color: "white" }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle" style={{ marginTop: '8px' }}>
            Manage your product stock, reorder levels, and track smart recommendations.
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          style={{ background: '#a855f7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Add New Product
        </button>
      </div>

      {showAdd && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e1e2e', padding: '30px', borderRadius: '16px', width: '400px', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Product</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>Product Name</label>
                <input 
                  type="text" 
                  value={newProduct.product_name} 
                  onChange={e => setNewProduct({...newProduct, product_name: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>Category</label>
                <input 
                  type="text" 
                  value={newProduct.category} 
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>Initial Stock</label>
                  <input 
                    type="number" 
                    value={newProduct.stock} 
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', opacity: 0.8 }}>Unit Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => setShowAdd(false)}
                  style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProduct}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <InventoryTable data={inventory} />
    </div>
  );
};

export default Inventory;
