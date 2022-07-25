import React, { useContext, useState, useEffect } from 'react';
const swell = require('swell-js');

interface SwellContextType {
    store: {
        swell: any;
    };
    account: any;
    createAccount: (params: any) => void;
    signIn: (params: any) => void;
    getLoggedInAccount: () => void;
    logout: () => void;
    isLoggedIn: boolean;
    setIsLoggedIn: (login: boolean) => void;
    addItemToCart: (product: any, selectedSize: any, selectedColor: any) => void;
    removeItemFromCart: (item: any) => void;
    clearCart: () => void;
    toggleCart: (value: any) => void;
}

export const SwellContext = React.createContext<SwellContextType>({} as SwellContextType);

export const useSwellContext = () => useContext(SwellContext);

swell.init('letterman', 'pk_W1tiV1pTlSpWAsvTeLTp5mgNg5AB0A0B', {
    useCamelcase: true
});

export function SwellProvider({ children, config }: { children: React.ReactNode; config: any }) {
    let initialStoreState = {
        swell,
        adding: false,
        showCart: false,
        cart: { itemQuantity: 0, items: [] },
        products: { results: [] }
    };

    let initialAccountState = {
        firstName: null,
        lastName: null,
        name: null,
        email: null,
        type: null,
        id: null,
        balance: 0,
        order_count: 0,
        order_value: 0
    };

    const [store, updateStore] = useState<any>(initialStoreState);
    const [account, updateAccount] = useState(initialAccountState);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const getGroupProducts = async () => {
            const p = await swell.products.list({
                category: 'provo', // Slug or ID
                limit: 25, // Max. 100
                page: 1
            });
            updateStore((prevState: any) => {
                return { ...prevState, products: p };
            });
        };

        getGroupProducts();
    }, []);

    useEffect(() => {
        const initializeCheckout = async () => {
            // Check for an existing cart.
            const c = await swell.cart.get();
            updateStore((prevState: any) => {
                return { ...prevState, cart: c };
            });
        };

        initializeCheckout();
    }, [store?.cart?.itemQuantity]);

    return (
        <SwellContext.Provider
            value={{
                store,
                account,
                createAccount: async (params = {}) => {
                    const user = await swell.account.create(params);
                    setIsLoggedIn(true);
                    updateAccount((prevState) => {
                        return { ...prevState, ...user };
                    });
                    return user;
                },
                signIn: async (params) => {
                    const user = await swell.account.login(params.email, params.password);
                    setIsLoggedIn(true);
                    updateAccount((prevState) => {
                        return { ...prevState, ...user };
                    });
                    return user;
                },
                getLoggedInAccount: async () => {
                    const account = await swell.account.get();
                    updateAccount((prevState) => {
                        return { ...prevState, ...account };
                    });
                    return account;
                },
                logout: async () => {
                    return swell.account.logout();
                },
                isLoggedIn: isLoggedIn,
                setIsLoggedIn: setIsLoggedIn,
                addItemToCart: async (product, selectedSize, selectedColor) => {
                    const c = await swell.cart.addItem({
                        product_id: `${product.id}`,
                        quantity: 1,
                        options: {
                            Size: `${selectedSize.name}`,
                            Color: `${selectedColor.name}`
                        },
                        metadata: {
                            Cost: product.cost,
                            School: product.organizationId,
                            Group: product.groupId
                        }
                    });
                    updateStore((prevState: any) => {
                        return { ...prevState, cart: c };
                    });
                },
                removeItemFromCart: async (item) => {
                    const c = await swell.cart.removeItem(item);
                    updateStore((prevState: any) => {
                        return { ...prevState, cart: c };
                    });
                },
                clearCart: async () => {
                    const c = await swell.cart.setItems([]);
                    updateStore((prevState: any) => {
                        return { ...prevState, cart: c };
                    });
                },
                toggleCart: (value) => {
                    updateStore((prevState: any) => {
                        return { ...prevState, showCart: !value };
                    });
                }
            }}
        >
            {children}
        </SwellContext.Provider>
    );
}
