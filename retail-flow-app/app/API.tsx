
const BASE_URL = "http://localhost:3001";
const API_ENPOINTS =  {
    LOGIN: `${BASE_URL}/api/login`,
    GET_PRODUCT_CATEGORIES: `${BASE_URL}/api/get-product-categories`,
    CREATE_PRODUCT_CATEGORY: `${BASE_URL}/api/create-product-category`,
    UPDATE_PRODUCT_CATEGORY: `${BASE_URL}/api/update-product-category`,
    DELETE_PRODUCT_CATEGORY: `${BASE_URL}/api/delete-product-category`,
    UPLOAD_PRODUCT_IMAGE: `${BASE_URL}/api/upload-product-image`,
    ADD_PRODUCT: `${BASE_URL}/api/add-product`,
    UPDATE_PRODUCT: `${BASE_URL}/api/update-product`,
    DELETE_PRODUCT: `${BASE_URL}/api/delete-product`,
    GET_PRODUCTS: `${BASE_URL}/api/get-products`,
    GET_USERS: `${BASE_URL}/api/get-users`,
    GET_SUPPLIERS: `${BASE_URL}/api/get-suppliers`,
    ADD_SUPPLIER: `${BASE_URL}/api/add-supplier`,
    UPDATE_SUPPLIER: `${BASE_URL}/api/update-supplier`,
    DELETE_SUPPLIER: `${BASE_URL}/api/delete-supplier`,
    ADD_CUSTOMER: `${BASE_URL}/api/add-customer`,
    GET_CUSTOMERS: `${BASE_URL}/api/get-customers`,
    UPDATE_CUSTOMER: `${BASE_URL}/api/update-customer`,
    DELETE_CUSTOMER: `${BASE_URL}/api/delete-customer`,
    UPDATE_CODE_FORMAT: `${BASE_URL}/api/update-code-format`,
    GET_CODE_FORMATS: `${BASE_URL}/api/get-code-formats`,
    GET_RECIEPT_ENTRY_CODE: `${BASE_URL}/api/get-reciept-entry-code`,
    CREATE_PURCHASE_ORDER: `${BASE_URL}/api/create-purchase-order`,
    GET_PURCHASE_ORDERS: `${BASE_URL}/api/get-purchase-orders`,
    GET_PURCHASE_ORDERS_DETAILS: `${BASE_URL}/api/get-purchase-orders-details`,
    DELETE_PURCHASE_ORDER: `${BASE_URL}/api/delete-purchase-order`,
    UPDATE_INVENTORY: `${BASE_URL}/api/auto-update-inventory`,
    CREATE_USER : `${BASE_URL}/api/create-user`,
    UPDATE_USER : `${BASE_URL}/api/update-user`,
    DELETE_USER : `${BASE_URL}/api/delete-user`,
    UPDATE_USER_STATUS : `${BASE_URL}/api/update-user-status`,
    GET_USER_ROLE : `${BASE_URL}/api/get-user-role`
}


export default API_ENPOINTS