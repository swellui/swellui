import { useEffect, useState } from 'react';

import { useCommerce } from '../provider/CommerceProvider';

export const useAccount = () => {
    const { account, setAccount } = useCommerce();
    return { account, setAccount };
};

export const useCart = () => {
    const { cart, setCart } = useCommerce();
    return { cart, setCart };
};

export const useImages = (product) => {
    const [images, setImages] = useState([]);
    const [isVariant, setIsVariant] = useState(false);
    const [hasVariant, setHasVariant] = useState(false);

    // check if incoming object is the parent product or variant by checking if the object has parent_id.
    if (product?.parent_id) {
        setIsVariant(true);
    } else if (product?.variants?.length > 0) {
        setHasVariant(true);
    }

    useEffect(() => {
        let productImages = [];
        let variantImages = [];
        let allImages = [];

        if (hasVariant) {
            productImages = product?.images?.map((image) => image);
            variantImages = product?.variants?.results
                .map((variant) => variant.images)
                .flat()
                .map((image) => image);
            allImages = productImages
                ?.concat(variantImages)
                .flat()
                .filter((v, i, a) => a.findIndex((v2) => v2.file.md5 === v.file.md5) === i);
        } else if (isVariant) {
            variantImages = product?.images?.map((image) => image);
            allImages = variantImages.filter((v, i, a) => a.findIndex((v2) => v2.file.md5 === v.file.md5) === i);
        } else {
            allImages = product?.images?.map((image) => image);
        }

        setImages(allImages);
    }, [hasVariant, isVariant, product]);

    return images;
};

export const usePrice = (product, number, inputLocale) => {
    const { swell } = useCommerce();
    const [price, setPrice] = useState(0);

    // move up to commerce provider?
    const [locale, setLocale] = useState(inputLocale);

    useEffect(() => {
        let userLocale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;

        setLocale(userLocale);
    }, []);

    // check and see if the product is on sale. If it is, get the sale price.
    // if it is not, get the regular price.
    useEffect(() => {
        const formatCurrency = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: product?.data?.currency || 'USD'
        });

        // swell.currency.format(10, {
        //   code: 'EUR',
        //   locale: 'en-GB'
        //   decimals: 4, // number of decimal digits
        //   rate: 0.8874 // conversion rate
        // })

        // add support for line items and number

        if (product?.sale) {
            setPrice(formatCurrency.format(product?.sale_price || 0));
        } else {
            setPrice(formatCurrency.format(product?.price || 0));
        }
    }, [product, locale]);

    return { price };

    // return originalPrice, salePrice, formattedPrice, discountPercentage, discountAmount, isOnSale
};

export const useProducts = () => {
    const { products, setProducts } = useCommerce();
    return { products, setProducts };
};

// get products by slug or ID

export const useProduct = (slug) => {
    const { swell } = useCommerce();
    const [product, setProduct] = useState({ data: {}, loading: false, error: false });
    const [variants, setVariants] = useState({ data: {}, loading: false, error: false });
    const [options, setOptions] = useState({ data: {}, loading: false, error: false });
    const [activeOptions, setActiveOptions] = useState({});
    // TODO
    // Purchase options: const [ purchaseOptions, setPurchaseOptions] = useState({ data: {}, loading: false, error: false });

    useEffect(() => {
        const fetchData = async (slug) => {
            setProduct({ loading: true });
            try {
                const product = await swell.get('/products', {
                    where: {
                        slug: slug
                    },
                    expand: ['variants']
                });
                setProduct({ loading: false, error: false, data: product.results[0] || {} });
            } catch (error) {
                setProduct({ loading: false, error: error, data: {} });
            }
        };

        fetchData(slug);
    }, [slug, swell]);

    useEffect(() => {
        const v = product?.data?.variants?.results;

        if (v?.length > 0) {
            setVariants(v);
        } else {
            setVariants([]);
        }
    }, [product]);

    useEffect(() => {
        const o = product?.data?.options;

        if (o?.length > 0) {
            setOptions(o);
        } else {
            setOptions([]);
        }
    }, [product]);

    const images = useImages(product.data);

    useEffect(() => {
        console.log('activeOptions', activeOptions);
    }, [activeOptions]);

    return { product, variants, options, activeOptions, setActiveOptions, images };
};

// useOptions returns active Variant if variant exists and selectedOptions are set

export const useOptions = (product, activeOptions) => {
    const { swell } = useCommerce();
    const [activeVariant, setActiveVariant] = useState({});
    // const [options, setOptions] = useState({});

    useEffect(() => {
        const getVariant = async () => {
            // Resolves the variation price, sale_price, orig_price, and stock_status values based on the customer's chosen options.
            const variation = await swell.products.variation(product.data, activeOptions);
            const variant = product?.data?.variants?.results.filter((variant) => variant.id === variation.variant_id)[0];
            setActiveVariant(variant);
        };

        if (activeOptions && product.data) {
            getVariant();
        }
    }, [activeOptions, product, swell.products]);

    // add stock and inventory check
    return { activeVariant };
};

// useCart returns cart, itemCount, cartTotal, cartItems, cartLoading, cartError, addItems, removeItems, update, clear

// product is in cart hook. returns isInCart, isAdded, isRemoved, isUpdated, isCleared.

// Path: commerce/hooks.js
