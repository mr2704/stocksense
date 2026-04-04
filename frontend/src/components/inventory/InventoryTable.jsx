import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import './InventoryTable.css';

const InventoryTable = ({ data, limits }) => {
  const { restockItem } = useInventory();
  const displayData = limits ? data.slice(0, limits) : data;

  const calculateRestockNeed = (item) => {
    const recommendedStock = item.avgDemand * item.leadTimeDays;
    return Math.max(0, recommendedStock - item.stock);
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
                  <div className="restock-info">
                    <span className="restock-amount">+{restockAmount}</span>
                    <span className="restock-cost">₹{(restockAmount * item.price).toFixed(2)}</span>
                  </div>
                </td>
                <td>
                  <button 
                    className="btn-order"
                    onClick={() => {
                       const qty = parseInt(prompt(`How many units of ${item.name} would you like to order?`), 10);
                       if (!isNaN(qty) && qty > 0) restockItem(item.id, qty);
                    }}
                  >
                    Order
                  </button>
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
