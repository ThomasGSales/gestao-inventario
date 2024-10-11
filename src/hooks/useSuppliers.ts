import { useState } from 'react';

// Define o tipo de fornecedor
interface Supplier {
    id: number;
    name: string;
    contact: string;
    address: string;
}

export function useSuppliers() {
    // Define o estado com o tipo correto
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const addSupplier = (supplier: Supplier) => {
        setSuppliers([...suppliers, supplier]);
    };

    const editSupplier = (supplierId: number, updatedSupplier: Supplier) => {
        setSuppliers(suppliers.map(s => s.id === supplierId ? updatedSupplier : s));
    };

    const deleteSupplier = (supplierId: number) => {
        setSuppliers(suppliers.filter(s => s.id !== supplierId));
    };

    return {
        suppliers,
        addSupplier,
        editSupplier,
        deleteSupplier,
    };
}