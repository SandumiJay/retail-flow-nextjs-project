import {
  Autocomplete,
  Button,
  Flex,
  Group,
  Input, // eslint-disable-line
  Modal,
  Select,
  Table,
  Text,
  TextInput,
  Divider, // eslint-disable-line
  Grid,
} from "@mantine/core";
import {
  IconEdit, // eslint-disable-line
  IconEye,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";
import React, { useEffect } from "react";
import API_ENPOINTS from "../../API";
import axios from "axios";
import jsPDF from 'jspdf';

interface Product {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  cost: number;
}



const PurchaseOrders: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = React.useState<any>([]); // eslint-disable-line
  const [supplierList, setSupplierList] = React.useState<string[]>([]);
  const [suppliersDataSet, setSuppliersDataSet] = React.useState<any>([]); // eslint-disable-line
  const [selectedSupplier, setSelectedSupplier] = React.useState<any>({});// eslint-disable-line
  const [productsDataSet, setProductsDataSet] = React.useState<any>([]);// eslint-disable-line
  const [productAutocompleteList, setProductAutocompleteList] = React.useState<any>([]);// eslint-disable-line
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [productCost, setProductCost] = React.useState<any>(undefined);// eslint-disable-line
  const [productQuantity, setProductQuantity] = React.useState<any>(undefined); // eslint-disable-line
  const [receiptRows, setReceiptRows] = React.useState<any>([]); // eslint-disable-line
  const [reciptEntries, setReciptEntries] = React.useState<any>([]);// eslint-disable-line
  const [viewAddItem, setViewAddItem] = React.useState<any>([]);// eslint-disable-line
  const [totalCost, setTotalCost] = React.useState<Number>(0);// eslint-disable-line
  const [isPosted, setIsPosted] = React.useState(false); // eslint-disable-line
  const [productCounter, setProductCounter] = React.useState<number>(1);
  const [purchaseOrdersDetails, setPurchaseOrdersDeatils] = React.useState<any[]>([]);// eslint-disable-line
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = React.useState<any>(null); // eslint-disable-line
  const [viewDetailsModal, setViewDetailsModal] = React.useState(false);
  const [productName, setProductName] = React.useState<string>(""); // eslint-disable-line
  const [sku, setSKU] = React.useState<string>(""); // eslint-disable-line
  const [selectedProductName, setSelectedProductName] = React.useState<string>("");

  const rows = purchaseOrders.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td style={{ textAlign: "left" }}>{product.purchaseOrderCode}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>{product.SupplierCode}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>{product.SupplierName}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>{product.docDate ? product.docDate.split("T")[0] : ""}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>LKR {product.TotalCost}</Table.Td>
      <Table.Td style={{ display: "flex", justifyContent: "end", gap: "5px" }}> 
        <Button 
          color="teal" 
          onClick={() => {
            handlePurchesOrderDetailsView(product); 
          }}
        >
          <IconEye />
        </Button>
        <Button color="red"
        onClick={() => handleRemovePurchaseOrder(product.purchaseOrderCode)} 
        >
          
          <IconTrashX />
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>PURCHASE ORDER</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>SUPPLIER CODE</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>SUPPLIER NAME</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>DATE</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>TOTAL COST</Table.Th>
      <Table.Th style={{ textAlign: "left" }}></Table.Th>
    </Table.Tr>
  );

  // const handleRemovePurchaseOrder = async (poCode: string) => {
  //   try {
  //     // Make a DELETE request to remove the purchase order
  //     await axios.post(`${API_ENPOINTS.DELETE_PURCHASE_ORDER}`, { param: poCode } )
      
  //     // Reload purchase orders after deletion
  //     loadPurchaseOrders();
      
  //     console.log('Purchase order removed successfully');
  //   } catch (error) {
  //     console.log('Error removing purchase order:', error);
  //   }
  // };

  
  const handleRemovePurchaseOrder = async(poCode: string) => {
    try {
      const response = await axios.post(API_ENPOINTS.DELETE_PURCHASE_ORDER ,{ // eslint-disable-line
        poCode: poCode
      });

      loadPurchaseOrders();
    } catch (error) {
      console.log(error)
    }
}

  const loadSuppliers = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_SUPPLIERS);
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
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      const products = response.data;
      setProductsDataSet(products);
      console.log(products)
  
      const autocompleteList = products.map((element: any) => `${element.sku} ${element.productName}`); // eslint-disable-line
      setProductAutocompleteList(autocompleteList);
    } catch (error) {
      console.log(error);
    }
  };
 

  const handleSupplierSelect = (value: string) => {
    const suppId = value;
    const newSupplier = suppliersDataSet.find((element: any) => element.id === parseInt(suppId)); // eslint-disable-line
  
    if (newSupplier && newSupplier.id !== selectedSupplier?.id) {
      setSelectedSupplier(newSupplier);
    }
  
    
  };

  const handleProductSelect = (value: string) => {
    
  const selectedValue = value;
  const firstValue = selectedValue.split(' ')[0];
    const seletedProduct = productsDataSet.find((element: any) => { // eslint-disable-line
      return element.sku === firstValue;
    });
    
    console.log(seletedProduct)
    setSelectedProductName(seletedProduct?.productName)
    console.log(selectedProductName)
    setSelectedProduct(seletedProduct);
    setSKU(seletedProduct.sku);
    setProductName(seletedProduct.productName);  
    setProductCost(seletedProduct.cost);
    
  };

  const handleAddProductToReciept = () => {
    if (selectedProduct && productQuantity > 0) {
      const newEntry = {
        ...selectedProduct,
        po_id: productCounter,
        quantity: productQuantity,
        cost: productCost,
      };
      setProductCounter((prevCounter) => prevCounter + 1);
      setReciptEntries((prevEntries: any) => [...prevEntries, newEntry]); // eslint-disable-line
      setTotalCost((prevTotalCost: any) => Number(prevTotalCost) + Number(productCost) * Number(productQuantity)); // eslint-disable-line
      
      setSelectedProductName('');
      setProductCost('');
      setProductQuantity('');
    }
    else{
      alert(`Product or Product Quantitiy Empty`);
    }
  };

  const handleRemoveProductfromReciept = (productsToRemove: any[]) => { // eslint-disable-line
    const updatedEntries = reciptEntries.filter(
      (entry: any) => !productsToRemove.some((product) => product.sku === entry.sku) // eslint-disable-line
    );
    const newTotalCost = updatedEntries.reduce(
      (total: number, item: any) => total + item.quantity * item.cost, // eslint-disable-line
      0
    );
  
    setReciptEntries(updatedEntries);
    setTotalCost(newTotalCost);
    // setReciptEntries('');
  };

  const handlePrintPurchaseOrder = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      const supplierName = selectedSupplier.name || "Unknown Supplier";
      const receiptDate = new Date().toLocaleDateString();
      const receiptItems = reciptEntries || [];
      const totalCost = receiptItems.reduce(
        (total, item) => total + item.quantity * item.cost,
        0
      );

      doc.setFontSize(16);
      doc.text('Purchase Order Receipt', 70, 20);
      doc.setFontSize(12);
      doc.text(`Supplier: ${supplierName}`, 20, 40);
      doc.text(`Date: ${receiptDate}`, 20, 50);
      doc.text('Product', 20, 70);
      doc.text('Qty', 90, 70);
      doc.text('Cost', 120, 70);
      doc.line(20, 72, 180, 72); 

      let startY = 80; // eslint-disable-line
      receiptItems.forEach((item, index) => {
        doc.text(item.productName || 'Unknown', 20, startY + (index * 10));
        doc.text(String(item.quantity), 90, startY + (index * 10));
        doc.text(`$${item.cost}`, 120, startY + (index * 10));
      });

      doc.setFontSize(14);
      doc.text(`Total: $${totalCost.toFixed(2)}`, 120, startY + (receiptItems.length * 10) + 10);
      doc.save('purchase_order_receipt.pdf'); 

      console.log('Receipt printed successfully');
    } catch (error) {
      console.log('Error generating receipt:', error);
    }
  };

  const handleSavePurchaseOrder = async () => {
    try {
      console.log("reciptEntries");
      console.log(reciptEntries);
      const response = await axios.post(API_ENPOINTS.CREATE_PURCHASE_ORDER, { // eslint-disable-line
        supplier: selectedSupplier,
        orderDetails: reciptEntries,
        totalCost: totalCost,
      });
      setIsPosted(true);
      loadPurchaseOrders();
      
    } catch (error) {
      console.log(error);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PURCHASE_ORDERS);
      console.log(response.data)
      setPurchaseOrders(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadPurchaseOrderDetails = async (poCode: string) => {
    try {
      const response = await axios.get(`${API_ENPOINTS.GET_PURCHASE_ORDERS_DETAILS}`, { params: { poCode } })
      setPurchaseOrdersDeatils(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePurchesOrderDetailsView = (order: any) => { // eslint-disable-line
    loadPurchaseOrderDetails(order.purchaseOrderCode);
    setViewDetailsModal(true);
  };

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadProducts();
  }, []);


  return (
    <div>
      <Flex justify="space-between">
        <h4>Purchase Orders</h4>
        <Button onClick={() => setViewAddItem('add')} color="teal">
          <IconSquareRoundedPlus />
        </Button>
      </Flex>

      <Modal
        opened={viewAddItem === 'add'}
        title={viewAddItem === 'add' ? "New Purchase Order" : "Add New Purchase Order "}
        size="60%"
        radius={0}
        onClose={() => {
          setViewAddItem(false);  
          setReceiptRows([]);
          setReciptEntries([]);          
          setSelectedSupplier([]); 
          setTotalCost(0);    
        }
        }
      >
        <Flex direction="column" gap="md">
          <Select
            label="Select Supplier"
            data={supplierList}
            onChange={handleSupplierSelect}
          />
         
         <Table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
  <Table.Tbody>
    <Table.Tr>
      <Flex justify="space-between" style={{ width: "100%" }}>
        
        {/* Left Column: Supplier Code and Name */}
        <Flex direction="column" style={{ width: "30%", gap: "10px" }}>
          <Group justify="flex-start">
            <Text color="dimmed" size="sm">Supplier Code:</Text>
            <Text size="sm">{selectedSupplier.code}</Text>
          </Group>
          <Group justify="flex-start">
            <Text color="dimmed" size="sm">Supplier Name:</Text>
            <Text size="sm">{selectedSupplier.name}</Text>
          </Group>
        </Flex>

        {/* Middle Column: Email and Phone */}
        <Flex direction="column" style={{ width: "30%", gap: "10px" }}>
          <Group justify="flex-start">
            <Text color="dimmed" size="sm">Email:</Text>
            <Text size="sm">{selectedSupplier.email}</Text>
          </Group>
          <Group justify="flex-start">
            <Text color="dimmed" size="sm">Phone:</Text>
            <Text size="sm">{selectedSupplier.phone}</Text>
          </Group>
        </Flex>

        {/* Right Column: Address */}
        <Flex direction="column" align="flex-start" style={{ width: "30%", gap: "10px" }}>
          <Group justify="flex-start">
            <Text color="dimmed" size="sm">Address:</Text>
            <Text size="sm">{selectedSupplier.address}</Text>
          </Group>
          <Group justify="flex-start">
          <Text color="dimmed" size="sm">City:</Text>
            <Text size="sm">{selectedSupplier.city}</Text>
          </Group>
          <Group justify="flex-start">
          <Text color="dimmed" size="sm">Country:</Text>
            <Text size="sm">{selectedSupplier.country}</Text>
          </Group>
        </Flex>

      </Flex>
    </Table.Tr>
  </Table.Tbody>
</Table>
        

<Grid gutter="md">
  {/* Row 1, Column 1: Autocomplete for Product Selection */}
  <Grid.Col span={4}>
    <Autocomplete
      label="Select Product"
      value ={selectedProductName}
      data={productAutocompleteList}
      onChange={(val)=>{
        setSKU(val.split(' ')[0]);
        setProductName(val.split(' ')[1]);
        handleProductSelect(val)
      }}
    />
  </Grid.Col>

  {/* Row 1, Column 2: Product Name (Read-only) */}
  {/* <Grid.Col span={6}>
    <TextInput
      label="Product"
      type="text"
      value={productName}
      readOnly
    />
  </Grid.Col> */}

  {/* Row 2, Column 1: Quantity */}
  <Grid.Col span={4}>
    <TextInput
      label="Quantity"
      type="number"
      value={productQuantity}
      onChange={(event) => setProductQuantity(Number(event.currentTarget.value))}
    />
  </Grid.Col>

  {/* Row 2, Column 2: Cost */}
  <Grid.Col span={4}>
    <TextInput
      label="Cost"
      type="number"
      value={productCost}
      onChange={(event) => setProductCost(Number(event.currentTarget.value))}
    />
  </Grid.Col>
</Grid>
          <Button onClick={handleAddProductToReciept}>Add Product</Button>
          <Table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
              reciptEntries.map((entry: any, index: number) => ( // eslint-disable-line
                <tr key={index}>
                  <td>{entry.sku}</td>
                  <td>{entry.productName}</td>
                  <td>{entry.quantity}</td>
                  <td>${entry.cost}</td>
                  <td>
                    <Button color="red" onClick={() => handleRemoveProductfromReciept([entry])}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Text>Total Cost: LKR {totalCost.toFixed(2)}</Text>
          <Button color="green"  onClick={handleSavePurchaseOrder}>Save Order</Button>
          <Button onClick={handlePrintPurchaseOrder}>Print Receipt</Button>
          <Button color="red" onClick={() =>{
          setViewAddItem(false);  
          setReceiptRows([]);
          setReciptEntries([]);          
          setSelectedSupplier([]); 
          setTotalCost(0);    
        }
        }>
            Cancel
          </Button>
        </Flex>
      </Modal>

      <Modal
        opened={viewDetailsModal}
        title="Purchase Order Details"
        onClose={() => setViewDetailsModal(false)}
      >
        {/* Details of the purchase order can be displayed here */}
        <Table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Cost</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrdersDetails.map((detail, index) => (
              <tr key={index}>
                <td>{detail.poCode}</td>
                <td>{detail.ProductCode}</td>
                <td>{detail.ProductName}</td>
                <td>${detail.cost}</td>
                <td>{detail.qty}</td>
              </tr>
              
            ))}
          </tbody>
          <tfoot>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>Tolat Cost:</th>
                <th>${purchaseOrdersDetails.reduce((sum, detail) => sum + (detail.cost * detail.qty), 0).toFixed(2)}</th>
                </tr>
          </tfoot>
        </Table>
        
      </Modal>

      <Table striped highlightOnHover>
      <Table.Thead>{headers}</Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default PurchaseOrders;