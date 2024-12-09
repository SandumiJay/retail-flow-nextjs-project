"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Select,
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
  Card,
  ModalContent,
  SelectSection,
  SelectItem,
  useDisclosure,
  ModalFooter,
} from "@nextui-org/react";
import { IconEye, IconTrashX, IconSquareRoundedPlus } from "@tabler/icons-react";
import API_ENDPOINTS from "../../API";

interface Product {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  cost: number;
}

interface Supplier {
    code: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    status: number;
  }

export default function PurchaseOrderPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [supplierList, setSupplierList] = useState<string[]>([]);
  const [suppliersDataSet, setSuppliersDataSet] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [productsDataSet, setProductsDataSet] = useState<any[]>([]);
  const [productAutocompleteList, setProductAutocompleteList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productCost, setProductCost] = useState<number | undefined>(undefined);
  const [productQuantity, setProductQuantity] = useState<number | undefined>(undefined);
  const [reciptEntries, setReciptEntries] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [viewAddItem, setViewAddItem] = useState<string | boolean>(false);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [viewDetailsModal, setViewDetailsModal] = React.useState(false);
  const [purchaseOrdersDetails, setPurchaseOrdersDeatils] = React.useState<any[]>([]);

  const loadSuppliers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_SUPPLIERS);
      setSuppliersDataSet(response.data);
      const spl = response.data.map((element: any) => ({ // eslint-disable-line
        value: element.id + "",
        label: element.name,
      }));
      setSupplierList(spl);
     
    } catch (error) {
      console.log(error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_PRODUCTS);
      const products = response.data;
      setProductsDataSet(products);
      console.log(products)
  
      const autocompleteList = products.map((element: any) => `${element.sku} ${element.productName}`); // eslint-disable-line
      setProductAutocompleteList(autocompleteList);
      console.log(autocompleteList);
    } catch (error) {
      console.log(error);
    }
  };
  const loadPurchaseOrderDetails = async (poCode: string) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GET_PURCHASE_ORDERS_DETAILS}`, { params: { poCode } })
      setPurchaseOrdersDeatils(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePurchesOrderDetailsView = (order: any) => { // eslint-disable-line
    loadPurchaseOrderDetails(order.purchaseOrderCode);
    setViewDetailsModal(true);
  };
 

  const loadPurchaseOrders = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_PURCHASE_ORDERS);
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error("Error loading purchase orders:", error);
    }
  };

  const handleProductSelect = (value: string) => {
    console.log(value)
    const selectedValue = value.split(" ");
    const sku = selectedValue[0];
    const productName = selectedValue[1];
    console.log(productName)

    const selectedProduct = productsDataSet.find((product: any) => product.sku === sku);
    if (selectedProduct) {
      setSelectedProductName(productName);
      setSelectedProduct(selectedProduct);
      setProductCost(selectedProduct.cost);
    }
  };

  const handleAddProductToReceipt = () => {
    console.log("Button clicked, adding product to receipt");
    console.log(selectedProduct)
    console.log(productQuantity)
    console.log(productCost)
    if (selectedProduct && productQuantity && productCost) {
      const newEntry = {
        sku: selectedProduct.sku,
        productName: selectedProduct.productName,
        quantity: productQuantity,
        cost: productCost,
      };
      setReciptEntries([...reciptEntries, newEntry]);

      const newTotalCost = reciptEntries.reduce((total: number, entry: any) => total + entry.quantity * entry.cost, 0);
      console.log(newTotalCost +' newTotalCost')
      setTotalCost(newTotalCost);
      setProductQuantity(undefined);
      setProductCost(undefined);
      setSelectedProduct(null);
    }
  };

  const handleRemoveProductfromReciept = (entryToRemove: any) => {
    const updatedEntries = reciptEntries.filter((entry) => entry.sku !== entryToRemove.sku);
    setReciptEntries(updatedEntries);

    const newTotalCost = updatedEntries.reduce((total: number, entry: any) => total + entry.quantity * entry.cost, 0);
    setTotalCost(newTotalCost);
  };

  const handleSavePurchaseOrder = async () => {
    try {
      await axios.post(API_ENDPOINTS.CREATE_PURCHASE_ORDER, {
        supplier: selectedSupplier,
        orderDetails: reciptEntries,
        totalCost,
      });
      setViewAddItem('');
      setReciptEntries([]);
      loadPurchaseOrders();
    } catch (error) {
      console.error("Error saving purchase order:", error);
    }
  };
  const handleSupplierSelect = (value: string) => {
    console.log(value)
    const suppId = value;
    const newSupplier = suppliersDataSet.find((element: any) => element.id === parseInt(suppId)); // eslint-disable-line
    console.log(newSupplier)
    if (newSupplier && newSupplier.id !== selectedSupplier?.id) {
      setSelectedSupplier(newSupplier);
    }
  
    
  };

  const handleRemovePurchaseOrder = async (poCode: string) => {
    try {
      await axios.post(API_ENDPOINTS.DELETE_PURCHASE_ORDER, { poCode });
      loadPurchaseOrders();
    } catch (error) {
      console.error("Error removing purchase order:", error);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadProducts();
  }, []);

  const headers = (
    <TableHeader>
      <TableColumn style={{ textAlign: "left" }}>PURCHASE ORDER</TableColumn>
      <TableColumn style={{ textAlign: "left" }}>SUPPLIER CODE</TableColumn>
      <TableColumn style={{ textAlign: "left" }}>SUPPLIER NAME</TableColumn>
      <TableColumn style={{ textAlign: "left" }}>DATE</TableColumn>
      <TableColumn style={{ textAlign: "left" }}>TOTAL COST</TableColumn>
      <TableColumn style={{ textAlign: "left" }}>Actions</TableColumn>
    </TableHeader>
  );

  const rows = purchaseOrders.map((order) => (
    <TableRow key={order.id}>
      <TableCell>{order.purchaseOrderCode}</TableCell>
      <TableCell>{order.SupplierCode}</TableCell>
      <TableCell>{order.SupplierName}</TableCell>
      <TableCell>{order.docDate?.split("T")[0]}</TableCell>
      <TableCell>LKR {order.TotalCost}</TableCell>
      <TableCell>
        <div className="grid gap-4 grid-cols-2">
              <Button onClick={() => handlePurchesOrderDetailsView(order)} title="Edit Product" className="flex flex-wrap gap-1 items-center">
            <IconEye />
          </Button>
          <Button color="secondary" onClick={() => handleRemovePurchaseOrder(order.purchaseOrderCode)} title="Delete Product" className="flex flex-wrap gap-1 items-center">
            <IconTrashX />
          </Button>
          </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <div>
      {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4>Purchase Orders</h4>
        <Button onClick={() => setViewAddItem("add")} color="primary">
          <IconSquareRoundedPlus />
        </Button>
      </div> */}

<div
                className="sticky top-0 overflow-hidden h-fit w-full items-center justify-between rounded-t-2xl bg-white px-4 pb-[20px] pt-4 shadow-2xl shadow-gray-100 dark:!bg-navy-700 dark:shadow-none"
                >
                <h1 className="text-3xl font-bold text-purple-800 dark:text-white">
                Purchase Orders
                </h1>
                <button
                    className=" absolute top-4 right-0 linear rounded-[20px] bg-purple-400 px-4 py-2 text-base font-medium text-brand-500 transition duration-200  hover:bg-purple-500 active:bg-purple-500 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20"
                    onClick={() => { open;
                      console.log("Opening Add Product Modal");
                      setViewAddItem("add");
                    }}
               
               >
                    Add Purchase Orders
                </button>
                </div>

      <Modal
        isOpen={viewAddItem === "add"}
        closeButton
        onClose={() => {
          setViewAddItem('');
          setReciptEntries([]);
          setSelectedSupplier({});
          setTotalCost(0);
        }}
       className="max-w-screen-lg"
      >
        <ModalContent>
        <ModalHeader>
          <h4>{viewAddItem === "add" ? "New Purchase Order" : "Add New Purchase Order"}</h4>
        </ModalHeader>
        <ModalBody>
        <Select
  items={supplierList}
  label="Select Supplier"
  placeholder="Select a Supplier"
  className="max-w-xs"
  onChange={(value) => {
    console.log("Supplier selected:", value.target.value);  // Debugging selected supplier value
    // Find the supplier object using the selected value
   
      handleSupplierSelect(value.target.value);  // Pass the full supplier object
  }}
>
  {supplierList.map((supplier, index) => {
    console.log("Supplier in list:", supplier.value);  // Debugging each supplier
    return (
      <SelectItem key={supplier.value} value={supplier.value}>
        {supplier.label}
      </SelectItem>
    );
  })}
</Select>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1rem" }}>
            <Card style={{ padding: "1rem", flex: "1" }}>
              <p><b>Supplier Code:</b> {selectedSupplier?.code}</p>
              <p><b>Supplier Name:</b> {selectedSupplier?.name}</p>
            </Card>
            <Card style={{ padding: "1rem", flex: "1" }}>
              <p><b>Email:</b> {selectedSupplier?.email}</p>
              <p><b>Phone:</b> {selectedSupplier?.phone}</p>
            </Card>
            <Card style={{ padding: "1rem", flex: "1" }}>
              <p><b>Address:</b> {selectedSupplier?.address}</p>
              <p><b>City:</b> {selectedSupplier?.city}</p>
              <p><b>Country:</b> {selectedSupplier?.country}</p>
            </Card>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "1rem" }}>
            <Autocomplete
              label="Select Product"
              value={selectedProductName}
              items={productAutocompleteList}
              onInputChange={(value) => {
                console.log("product selected:", value);  
               
                handleProductSelect(value);  // Pass the full supplier object
              }}
            
            >
                {productAutocompleteList.map((item, index) => {
    console.log("item in list:", item);  // Debugging each supplier
    return (
      <AutocompleteItem key={item} value={item}>
        {item}
      </AutocompleteItem>
    );
  })}
            </Autocomplete>

            <Input
              label="Quantity"
              type="number"
              value={productQuantity || ""}
              onChange={(e) => setProductQuantity(Number(e.target.value))}
            />

            <Input
              label="Cost"
              type="number"
              value={productCost || ""}
              onChange={(e) => setProductCost(Number(e.target.value))}
            />
        <Button 
  onClick={() => {
    console.log("Opening Add Product Modal");
    handleAddProductToReceipt(); // Call the function
  }}
>
  Add
</Button>
           
          </div>
          <Table>
            <TableHeader>
              
                <TableColumn>SKU</TableColumn>
                <TableColumn>Product Name</TableColumn>
                <TableColumn>Quantity</TableColumn>
                <TableColumn>Cost</TableColumn>
                <TableColumn children={undefined}></TableColumn>

            </TableHeader>
            <TableBody>
              {
              reciptEntries.map((entry: any, index: number) => ( // eslint-disable-line
                <TableRow key={index}>
                  <TableCell>{entry.sku}</TableCell>
                  <TableCell>{entry.productName}</TableCell>
                  <TableCell>{entry.quantity}</TableCell>
                  <TableCell>${entry.cost}</TableCell>
                  <TableCell>
                    <Button color="danger" onClick={() => handleRemoveProductfromReciept([entry])}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <p><b>Total Cost:</b> LKR {totalCost}</p>
            <Button onClick={handleSavePurchaseOrder}>Save Order</Button>
          </div>
        </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={viewDetailsModal}
        title="Purchase Order Details"
        onClose={() => setViewDetailsModal(false)}
      >
        {/* Details of the purchase order can be displayed here */}
        <ModalContent>
        <Table>
          <TableHeader>
            
              <TableColumn>SKU</TableColumn>
              <TableColumn>Product Code</TableColumn>
              <TableColumn>Product Name</TableColumn>
              <TableColumn>Cost</TableColumn>
              <TableColumn>Quantity</TableColumn>
            
          </TableHeader>
          <TableBody>
            {purchaseOrdersDetails.map((detail, index) => (
              <TableRow key={index}>
                <TableCell>{detail.poCode}</TableCell>
                <TableCell>{detail.ProductCode}</TableCell>
                <TableCell>{detail.ProductName}</TableCell>
                <TableCell>${detail.cost}</TableCell>
                <TableCell>{detail.qty}</TableCell>
              </TableRow>
              
            ))}
          </TableBody>
          </Table>
          <ModalFooter>
            
                <h4>Tolat Cost:</h4>
                <h4>${purchaseOrdersDetails.reduce((sum, detail) => sum + (detail.cost * detail.qty), 0).toFixed(2)}</h4>
          </ModalFooter>
       
          </ModalContent>
      </Modal>
      <Table aria-label="Receipt Items">
            {headers}
            <TableBody>{rows}</TableBody>
          </Table>

    </div>
  );
}