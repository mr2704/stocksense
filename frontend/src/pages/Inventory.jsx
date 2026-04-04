import React, { useState } from 'react';
import InventoryTable from '../components/inventory/InventoryTable';
import { Package, Plus, Filter, Download } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import './Inventory.css';

const Inventory = () => {
  const { inventory, addProduct } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Products');
  const [sortOption, setSortOption] = useState('default');

  const filteredData = inventory.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower) ||
      item.id.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower);

    let matchesTab = true;
    if (activeTab === 'Low Stock') {
      matchesTab = item.stock <= item.reorderPoint && item.stock > 0;
    } else if (activeTab === 'Out of Stock') {
      matchesTab = item.stock === 0;
    }

    return matchesSearch && matchesTab;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortOption) {
      case 'alpha-asc':
        return a.name.localeCompare(b.name);
      case 'alpha-desc':
        return b.name.localeCompare(a.name);
      case 'stock-asc':
        return a.stock - b.stock;
      case 'stock-desc':
        return b.stock - a.stock;
      case 'demand-asc':
        return a.avgDemand - b.avgDemand;
      case 'demand-desc':
        return b.avgDemand - a.avgDemand;
      default:
        return 0;
    }
  });

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Name,Category,Stock,Reorder Point,Avg Demand,Price\n"
      + filteredData.map(e => `${e.id},"${e.name}",${e.category},${e.stock},${e.reorderPoint},${e.avgDemand},${e.price}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddProduct = () => {
    const name = prompt("Enter product model name:");
    if (!name) return;
    const id = prompt("Enter product model number or SKU:");
    if (!id) return;

    const newProduct = {
      id: id,
      name: name,
      category: 'Newly Added',
      stock: 0,
      reorderPoint: 10,
      avgDemand: 1,
      leadTimeDays: 7,
      price: 99.99
    };
    addProduct(newProduct);
  };

  return (
    <div className="inventory-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Manage your stock, track SKUs, and monitor supply levels.</p>
        </div>
        <div className="header-actions-group">
          <select 
            className="btn-secondary" 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <option value="default">Sort by...</option>
            <option value="alpha-asc">Alphabetical (A-Z)</option>
            <option value="alpha-desc">Alphabetical (Z-A)</option>
            <option value="stock-asc">Stock (Low to High)</option>
            <option value="stock-desc">Stock (High to Low)</option>
            <option value="demand-asc">Demand (Low to High)</option>
            <option value="demand-desc">Demand (High to Low)</option>
          </select>
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            Export
          </button>
          <button className="btn-primary" onClick={handleAddProduct}>
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <div className="inventory-content glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div className="content-toolbar">
          <div className="tab-group">
            <button className={`tab ${activeTab === 'All Products' ? 'active' : ''}`} onClick={() => setActiveTab('All Products')}>All Products</button>
            <button className={`tab ${activeTab === 'Low Stock' ? 'active' : ''}`} onClick={() => setActiveTab('Low Stock')}>Low Stock</button>
            <button className={`tab ${activeTab === 'Out of Stock' ? 'active' : ''}`} onClick={() => setActiveTab('Out of Stock')}>Out of Stock</button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, SKU or category..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <InventoryTable data={sortedData} />
      </div>
    </div>
  );
};

export default Inventory;
