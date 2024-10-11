import { Button } from '@/components/ui/button';
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <>  
                <header>
                    <Link to="/suppliers">
                        <p>Fornecedores</p>
                    </Link>
                </header>
                
                <h1>Welcome to the Inventory Management System</h1>
        </>
    );
}

export default Home;