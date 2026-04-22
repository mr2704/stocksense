import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import './InventoryTable.css';

const InventoryTable = ({ data, limits }) => {
  const { restockItem, orderItem, deleteItem } = useInventory();
  const displayData = limits ? data.slice(0, limits) : data;

  // ─── Restock formula ────────────────────────────────────────────────────────
  // Restock = (avgDemand/day × leadTimeDays) + safetyStock − currentStock
  // If result ≤ 0 we already have enough stock → show 0
  const SAFETY_STOCK = 10;   // minimum buffer units
  const DEFAULT_LEAD_TIME = 5;  // days
  const DEFAULT_AVG_DEMAND = 10; // units/day

  const calculateRestockNeed = (item) => {
    const avgDemand   = Number(item.avgDemand)  || DEFAULT_AVG_DEMAND;
    const leadTime    = Number(item.leadTimeDays) || DEFAULT_LEAD_TIME;
    const currentStock = Number(item.stock) || 0;

    const recommended = (avgDemand * leadTime) + SAFETY_STOCK;
    return Math.max(0, Math.ceil(recommended - currentStock));
  };

  const getStatusBadge = (stock, reorderPoint) => {
    if (stock === 0) return <span className="status-badge danger">Out of Stock</span>;
    if (stock <= reorderPoint) return <span className="status-badge warning">Low Stock</span>;
    return <span className="status-badge success">In Stock</span>;
  };

  return (
    <div className="table-container">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product Name & SKU</th>
            <th>Category</th>
            <th>Current Stock</th>
            <th>Status</th>
            <th>Avg Demand/Day</th>
            <th>Unit Price</th>
            <th>Smart Restock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((item) => {
            const restockAmount = calculateRestockNeed(item);
            
            return (
              <tr key={item.id} className={item.stock <= item.reorderPoint ? 'row-warning' : ''}>
                <td>
                  <div className="product-info">
                    <span className="product-name">{item.name}</span>
                    <span className="product-sku">{item.id}</span>
                  </div>
                </td>
                <td><span className="category-pill">{item.category}</span></td>
                <td>
                  <span className={`stock-count ${item.stock <= item.reorderPoint ? 'text-danger' : ''}`}>
                    {item.stock}
                  </span>
                </td>
                <td>{getStatusBadge(item.stock, item.reorderPoint)}</td>
                <td>{item.avgDemand} units</td>
                <td>
                  <span className="unit-price">₹{item.price.toFixed(2)}</span>
                </td>
                <td>
                  <div className="restock-info">
                    <span className="restock-amount">+{restockAmount}</span>
                    <span className="restock-cost">₹{(restockAmount * item.price).toFixed(2)}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-order"
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => {
                        console.log('Attempting to remove stock for item:', item);
                        const raw = prompt(`How many units of ${item.name} would you like to remove?`);
                        const qty = parseInt(raw, 10);
                        console.log('Parsed quantity:', qty);
                        if (isNaN(qty) || qty <= 0) {
                          alert('Please enter a valid positive integer quantity.');
                          return;
                        }
                        if (qty >= item.stock) {
                          if (window.confirm(`Removing ${qty} units will delete the product (stock will be zero). Continue?`)) {
                            console.log('Quantity exceeds or equals stock, deleting item id:', item.id);
                            deleteItem(item.id);
                          }
                        } else {
                          console.log('Updating stock via orderItem, id:', item.id, 'qty:', qty);
                          orderItem(item.id, qty);
                        }
                      }}
                    >
                      Remove Stock
                    </button>
                    <button 
                      className="btn-order"
                      style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => {
                        const raw = prompt(`How many units of ${item.name} would you like to restock?`);
                        const qty = parseInt(raw, 10);
                        if (isNaN(qty) || qty <= 0) {
                          alert('Please enter a valid positive integer quantity.');
                          return;
                        }
                        restockItem(item.id, qty);
                      }}
                    >
                      Restock
                    </button>
                    <button 
                      className="btn-order"
                      style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to completely delete ${item.name}?`)) {
                          deleteItem(item.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
