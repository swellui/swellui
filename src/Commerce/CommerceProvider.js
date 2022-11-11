import React, { useContext, useState } from 'react';
import swell from 'swell-js';

swell.init('dennis', 'pk_xceG4EJUqj68OAia03UddurHlvVTwjNk');

const CommerceContext = React.createContext();

export const useCommerce = () => useContext(CommerceContext);

export const CommerceProvider = ({ children }) => {
 
    // State that the commerce provider holds and the hooks will use.
    const [account, setAccount] = useState({});
    const [cart, setCart] = useState({ itemQuantity: 0, items: [] });
    const [products, setProducts] = useState({ results: [] });

    return (
        <CommerceContext.Provider
            value={{
                swell,
                account,
                setAccount,
                cart,
                setCart,
                products,
                setProducts
            }}
        >
            {children}
        </CommerceContext.Provider>
    );
};

//These hooks have to be called in components nested in the provider. I will eventually move these to their own folder.
