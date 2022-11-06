import React, { useContext, useState, useEffect } from 'react';
const swell = require('swell-js');

interface CommerceContextType {
    store: {
        swell: any;
    };
    account: any;
    createAccount: (params: any) => void;
    signIn: (params: any) => Promise<any>;
    getLoggedInAccount: () => void;
    logout: () => Promise<void>;
    isLoggedIn: any;
    setIsLoggedIn: (user: any) => void;
    addItemToCart: (product: any, selectedSize: any, selectedColor: any) => void;
    removeItemFromCart: (item: any) => void;
    clearCart: () => void;
    toggleCart: (value: any) => void;
    toggleAddToCartButton: (value: any) => void;
    listAllSubscriptions: (value: any) => Promise<void>;
    getSubscription: (id: string) => void;
    pauseSubscription: (id: string) => void;
    skipSubscription: (id: string, months: number) => Promise<any>;
    resumeSubscription: (id: string) => Promise<any>;
    cancelSubscription: (id: string) => void;
    listAccountOrders: () => Promise<void>;
    listNavMenus: (id: string) => Promise<any>;
}

export const CommerceContext = React.createContext<CommerceContextType>({} as CommerceContextType);

export const useCommerceContext = () => useContext(CommerceContext);

export function CommerceProvider({ children, config }: { children: React.ReactNode; config: any }) {
    swell.init(config.storeId, config.publicKey, {
        useCamelCase: true
    });

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

    const [isLoggedIn, setIsLoggedIn] = useState(null);

    const getLoggedInAccount = async () => {
        const account = await swell.account.get();
        updateAccount((prevState) => {
            return { ...prevState, ...account };
        });
        return account;
    };
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

        const getAuth = async () => {
            const user = await getLoggedInAccount();
            if (user !== null) {
                setIsLoggedIn(user);
            }
        };

        getAuth();
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
        <CommerceContext.Provider
            value={{
                store,
                account,
                createAccount: async (params = {}) => {
                    const user = await swell.account.create(params);
                    setIsLoggedIn(user);
                    updateAccount((prevState) => {
                        return { ...prevState, ...user };
                    });
                    return user;
                },
                signIn: async (params) => {
                    const user = await swell.account.login(params.email, params.password);
                    setIsLoggedIn(user);
                    updateAccount((prevState) => {
                        return { ...prevState, ...user };
                    });
                    return user;
                },
                getLoggedInAccount: getLoggedInAccount,
                logout: async () => {
                    await swell.account.logout();
                    setIsLoggedIn(null);
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
                        }
                    });
                    updateStore((prevState: any) => {
                        return { ...prevState, cart: c, showCart: true, adding: false };
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
                },
                toggleAddToCartButton: (value) => {
                    updateStore((prevState: any) => {
                        return { ...prevState, adding: !value };
                    });
                },
                listAllSubscriptions: async () => {
                    const subscriptions = await swell.subscriptions.list();
                    return subscriptions;
                },
                getSubscription: async (id: string) => {
                    const subscription = await swell.subscriptions.get(id);
                    return subscription;
                },
                pauseSubscription: async (id: string) => {
                    const subscription = await swell.subscriptions.update(id, {
                        paused: true,
                        date_pause_end: null
                    });

                    return subscription;
                },
                skipSubscription: async (id: string, months = 1) => {
                    const date = new Date();

                    date.setMonth(date.getMonth() + months);

                    const subscription = await swell.subscriptions.update(id, {
                        paused: true,
                        date_pause_end: date.toISOString()
                    });

                    return subscription;
                },
                resumeSubscription: async (id: string) => {
                    const subscription = await swell.subscriptions.update(id, {
                        paused: false
                    });

                    return subscription;
                },
                cancelSubscription: async (id: string) => {
                    const subscription = await swell.subscriptions.update(id, {
                        canceled: true
                    });

                    return subscription;
                },
                listAccountOrders: async () => {
                    return swell.account.listOrders({});
                },
                listNavMenus: async (id: string) => {
                    const headers = await swell.settings.menus(id);
                    return headers;
                }
            }}
        >
            {children}
        </CommerceContext.Provider>
    );
}
