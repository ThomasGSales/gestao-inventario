import React, { useState } from 'react';
import "../styles/Suppliers.css"
import { useSuppliersContext } from '../contexts/SuppliersContext';

const Suppliers = () => {
    const { suppliers, addSupplier, editSupplier, deleteSupplier } = useSuppliersContext();
    const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', address: '' });

    const handleAddSupplier = () => {
        const id = suppliers.length ? suppliers[suppliers.length - 1].id + 1 : 1;
        addSupplier({ ...newSupplier, id });
        setNewSupplier({ name: '', contact: '', address: '' });
    };

    return (
        <>
            <div className='supplier-father'>
                <h1 style={{position: "relative", top: "-50px", fontSize: "40px"}}>Manage Suppliers</h1>
                <div className="supplier-region">
                    <input
                        type="text"
                        placeholder="Name"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Contact"
                        value={newSupplier.contact}
                        onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Address"
                        value={newSupplier.address}
                        onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                    />
                    <button onClick={handleAddSupplier}>Add Supplier</button>
                </div>
                <ul>
                    {suppliers.map((supplier: any) => (
                        <li key={supplier.id}>
                            {supplier.name} - {supplier.contact} - {supplier.address}
                            <button onClick={() => deleteSupplier(supplier.id)}>Delete</button>
                            {/* You can add edit functionality here */}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Suppliers;