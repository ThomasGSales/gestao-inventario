import React, { createContext, useContext } from 'react';
import { useSuppliers } from '../hooks/useSuppliers';

interface Supplier {
    id: number;
    name: string;
    contact: string;
    address: string;
}

const SuppliersContext = createContext<any>(null);

export const SuppliersProvider = ({ children }: any) => {
    const suppliersData = useSuppliers();

    return (
        <SuppliersContext.Provider value={suppliersData}>
            {children}
        </SuppliersContext.Provider>
    );
};

export const useSuppliersContext = () => useContext(SuppliersContext);