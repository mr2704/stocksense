import React from 'react';
import InventoryTable from '../components/inventory/InventoryTable';
import { Package, Plus, Filter, Download } from 'lucide-react';
import { inventoryData } from '../utils/mockData';
import './Inventory.css';

const Inventory = () => {
  return (
    <div className="inventory-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Manage your stock, track SKUs, and monitor supply levels.</p>
        </div>
        <div className="header-actions-group">
          <button className="btn-secondary">
            <Filter size={18} />
            Filter
          </button>
          <button className="btn-secondary">
            <Download size={18} />
            Export
          </button>
          <button className="btn-primary">
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <div className="inventory-content glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div className="content-toolbar">
          <div className="tab-group">
            <button className="tab active">All Products</button>
            <button className="tab">Low Stock</button>
            <button className="tab">Out of Stock</button>
          </div>
          <div className="search-box">
             <input type="text" placeholder="Search by name, SKU or category..." className="search-input" />
          </div>
        </div>
        
        <InventoryTable data={inventoryData} />
      </div>
    </div>
  );
};

export default Inventory;
