"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Switch,
  Table,
  Image,
  Modal,
  Badge,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ModalContent,
  Chip,
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
  DateInput,
  Card,
  SelectItem,
  Select,
  DatePicker,
} from "@nextui-org/react";
import { IconX, IconEdit, IconTrashX } from "@tabler/icons-react";
import API_ENPOINTS from "../API";
import config from "../config";
import { AxiosResponse } from "axios";
import { toPng,toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useDateFormatter} from "@react-aria/i18n";
import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  discount?: number;
  sku?: string;
}

interface Customer {
  code: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  status: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsDataSet, setProductsDataSet] = useState<any>([]);
  const [productAutocompleteList, setProductAutocompleteList] = useState<any>([]);
  const [invoiceItemsList, setInvoiceItemsList] = useState<any>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Date | null>(null);
  const [postDate, setPostDate] = useState(today(getLocalTimeZone()));
  const [dueDate, setDueDate] = useState(today(getLocalTimeZone()));
  const [productName, setProductName] = useState<string>("");
  const [sku, setSKU] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [customerDataSet, setCustomerDataSet] = useState<any>([]);
  const [customerName, setCustomerName] = useState<any>([]);
  const [contactNumber, setContactNumber] = useState<any>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [maxQty, setMaxQty] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<any>([]);
  let formatter = useDateFormatter({dateStyle: "full"});

  const handleAddToCart = () => {
    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }

    const existingProduct = cart.find((item) => item.id === selectedProduct.id);

    const totalQuantity = existingProduct
    ? (existingProduct.quantity ?? 0) + quantity
    : quantity;
    console.log(totalQuantity)

    if (totalQuantity > maxQty) {
      alert(`Cannot add more than ${maxQty} of ${selectedProduct.productName}`);
      return;
    }

    setCart((prev) => {
      if (existingProduct) {
        return prev.map((item) =>
          item.id === selectedProduct.id
            ? { ...item, quantity:(item.quantity ?? 0) + quantity }
            : item
        );
      } else {
        return [...prev, { ...selectedProduct, quantity, discount }];
      }
    });

    setQuantity(0);
    setSelectedProduct(null);
    setProductName("");
    setSKU("");
    setDiscount(0);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {

    setCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    let response: AxiosResponse<any, any>;
    try {
      console.log(cart);
      const updatePayload = cart.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));

      console.log(updatePayload);
      response = await axios.put(API_ENPOINTS.UPDATE_INVENTORY, { products: updatePayload });

      alert("Checkout confirmed. Inventory updated successfully.");
      setCart([]);
      setCheckoutModalOpen(false);
      setContactNumber("");
      setCustomerName("");
    } catch (error) {
      console.error("Error response:", error.response.data.message);
      alert("Failed to update inventory. Please try again." + error.response.data.message);
    }
  };

  const handleProductSelect = (sku: string) => {
    sku = sku.split(' ')[0];
    const product = productsDataSet.find((p) => p.sku === sku);
    console.log(productsDataSet)
    if (product) {
      setSelectedProduct(product);
      setProductName(product.productName);
      setSKU(product.sku);
    }
  };

  const handleCustomerSelect = (contact: string) => {
    let contact_s =contact.split(" ")[0]
    const customer = customerDataSet.find((p) => p.contact === contact_s);
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerName(customer.name);
      setContactNumber(customer.contact);
    }
  };

  const handleDiscountChange = (val: number | undefined) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setMaxDiscount(product.maxDiscount);
      if (val !== undefined) {
        if (val > maxDiscount) {
          alert(`Discount cannot exceed LKR ${maxDiscount}%`);
          setDiscount(maxDiscount);
        } else {
          setDiscount(val);
        }
      } else {
        setDiscount(0);
      }
    }
  };

  const handleQtyChange = (val: number | undefined) => {
    console.log(val)
    const product = productsDataSet.find((p) => p.sku === sku);
    console.log(product)
    if (product) {
      setMaxQty(product.intQty);
      if (val !== undefined) {
        if (val > maxQty) {
          alert(`Quantity cannot exceed ${maxQty}`);
          setQuantity(0);
        } else {
          setQuantity(val);
        }
      } else {
        setQuantity(0);
      }
    }
  };

  const calculateDiscountedPrice = (price: number, discount: number): number => {
    return price - (price * (discount / 100));
  };

  const cartTotal = cart
  .reduce((acc, item) => acc + (calculateDiscountedPrice(item.price ?? 0, item.discount ?? 0) * (item.quantity ?? 0)), 0)
  .toFixed(2);

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      const products = response.data;

      const availableProducts = products.filter((product: any) => product.intQty > 0);

      setProductsDataSet(products);
      const autocompleteList = availableProducts.map((element: any) => `${element.sku} ${element.productName}`);
      setProductAutocompleteList(autocompleteList);
    } catch (error) {
      console.log(error);
    }
  };

  const loadCustomer = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_CUSTOMERS);
      const customer = response.data;
      setCustomerDataSet(customer);
    } catch (error) {
      console.log(error);
    }
  };

  const saveCheckoutAsPNG = async () => {
    if (!modalRef.current) {
      alert("Modal content not available for rendering.");
      return;
    }
    try {
      const dataUrl = await toPng(modalRef.current);
      const link = document.createElement("a");
      link.download = "checkout_summary.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error capturing modal as PNG:", error);
      alert("Failed to save as PNG.");
    }
  };

  const sendEmail = (event: React.FormEvent) => {
    event.preventDefault();

    const templateParams = {
      to_name: customerName,
      from_name: "Your Business Name",
      message: `Thank you for your order! Here is your order summary: Total:  LKR ${cartTotal}`,
      email: customerEmail,
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
        alert("Email sent successfully!");
      }, (error) => {
        console.log('Failed to send email:', error);
        alert("Failed to send email.");
      });
  };

  const generatePDF = async () => {
    if (!modalRef.current) return alert("No content to render.");

    try {
      const dataUrl = await toPng(modalRef.current);
      console.log(dataUrl)
      const pdf = new jsPDF();
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
      pdf.save("checkout_summary.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF.");
    }
  };

  



  useEffect(() => {
    loadProducts();
    loadCustomer();
    // const today = new Date();
    // setPostDate(today);
    // setDueDate(today);
  }, []);


  
  const renderInvoiceTemplate = () => {
    const rows = cart.map(
      (item) =>
        `<tr>
          <td>${item.quantity}</td>
          <td>${item.productName}</td>
          <td>${item.discount}%</td>
          <td>${item.price.toFixed(2)}</td>
          <td>${(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 0)).toFixed(2)}</td>
        </tr>`
    );

    return `
    <style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f6f9;
    }

    .invoice-container {
        width: 95%;
        margin: 40px auto;
        background-color: white;
        border-radius: 8px;
        padding: 30px;
       

    .header {
        text-align: center;
        color: #7209b7;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 20px;
    }

    .contact-info {
        text-align: center;
        font-size: 14px;
        color: #555;
        margin-bottom: 30px;
    }
  .customer {
        margin-top: 10px;
    }

    .customer table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-bottom: 20px;
        
    }

    .customer th, .details td {
        text-align: left;
        padding: 12px;
        border: 1px solid #ddd; 
    }

    .customer th {
        background-color: #7209b7;
        color: white;
        text-transform: uppercase;
    }
  .details {
        margin-top: 5px;
    }


   .details table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-bottom: 20px;
}

.details th, .details td {
    text-align: left;
    padding: 8px;
    border-left: 1px solid #ddd; 
    border-right: 1px solid #ddd; 
}

.details th:first-child, .details td:first-child {
    border-left: none; 
}

.details th:last-child, .details td:last-child {
    border-right: none;
}

.details th {
    background-color: #7209b7;
    color: white;
    text-transform: uppercase;
}

.details td {
    background-color: #f9f9f9;
}

    .totals {
        margin-top: 20px;
        font-size: 12px;
        text-align: auto;
    }

    .totals p {
        margin: 10px 0;
    }

    .totals b {
        font-weight: 600;
    }

    .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 14px;
        color: #777;
    }

    .signature {
        margin-top: 40px;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #555;
    }

    .signature p {
        border-top: 1px solid #ddd;
        padding-top: 10px;
        width: 45%;
        text-align: center;
    }

    .button {
        display: inline-block;
        background-color: #0044cc;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 4px;
        margin-top: 20px;
        font-size: 14px;
        text-align: center;
    }

    .button:hover {
        background-color: #0033a0;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .invoice-container {
            width: 95%;
        }
        .signature {
            flex-direction: column;
            align-items: center;
        }
    }
</style>

<div class="invoice-container">
    <div class="header">ANURADHA TRANSPORT SERVICES</div>
    <div class="contact-info">
        <p>No. 219, Nawana, Mirigama</p>
        <p>Tel: 077 898 929 | 0770 584 959 | 0772 898 929</p>
    </div>

    <div class="customer">
        <table>
            <tr>
                <td><b>Invoice No:</b> INV-${new Date().getTime()}</td>
                <td><b>Date:</b> ${postDate ? formatter.format(postDate.toDate(getLocalTimeZone())) : "--"}  | <b>Due On:</b> ${dueDate ? formatter.format(dueDate.toDate(getLocalTimeZone())) : "--"}</td>

                </tr>
            <tr>
                <td><b>Brown & Company PLC</b>
                <br>
                Pharmacutical Division
                <br>
                34, Sir Mohomed Macan Marker Mawatha
                <br>
                Colombo 03
                <br>
                Tel : 011 266 3000 
                </td>
                <td><b>Customer:</b> ${customerName} 
                <br>
                <b>Contact Number:</b>${contactNumber}
                <br>
                <b>Address:</b> ${selectedCustomer?.address || "N/A"}
                </td>
        
            </tr>
              
           
        </table>
    </div>

    <div class="details">
        <table>
            <tr>
                <th>Qty</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Unit Price (LKR)</th>
                <th>Amount (LKR)</th>
            </tr>
            ${rows.join("")}
            <tr>
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="padding: 5px;"><b>Gross Total &emsp;:</b> </td>
    <td style="padding: 5px;"> 
        <p>LKR ${cartTotal}</p>
    </tr>
              <tr >
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="border: none; padding: 5px;"></td>
    <td style="padding: 5px;"><b>Net Total &emsp;&emsp;:</b> </td>
    <td style="padding: 5px;"> 
        <p>LKR ${cartTotal}</p></td>
    </tr>
        </table>

    <div class="footer">
        <p>PLEASE DRAW THE CHEQUE IN FAVOUR OF ANURADHA TRANSPORT SERVICES</p>
    </div>

    <div class="signature">
        <p>Checked by: ____________________________</p>
        <p>Customer: ____________________________</p>
    </div>

</div>
    `;



  };

  function parseZonedDateTime(arg0: string): any {
    throw new Error("Function not implemented.");
  }

  return (
    <>

<div className="bg-gray-100 w-screen h-screen py-12">
  <div className="grid mx-auto w-10/12 h-max px-6 py-12 gap-1 bg-white border-0 shadow-lg sm:rounded-3xl">
    <label className="text-2xl font-bold mb-8">POS System</label>

    {/* Main Flex Layout */}
    <div className="flex flex-col md:flex-row gap-6">

      {/* Left Section: Customer and Product Information */}
      <div className="flex-1 space-y-6">

        {/* Customer Information Section */}
        <Card shadow="sm" className="flex flex-col gap-5 px-4 py-4">
          <label className="px-4 text-lg">Search</label>
          <Autocomplete
            aria-label="customer-search"
            className="px-4"
            items={customerDataSet.map((customer) => {
              const displayValue = `${customer.contact} ${customer.name}`;
              return displayValue;
            })}
            value={search}
            onInputChange={(val) => {
              setSearch(val);
              handleCustomerSelect(val);
            }}
            placeholder="Customer Name or Contact Number"
          >
            {customerDataSet.map((customer, index) => {
              const displayValue = `${customer.contact} ${customer.name}`;
              return (
                <AutocompleteItem key={index} value={displayValue}>
                  {displayValue}
                </AutocompleteItem>
              );
            })}
          </Autocomplete>

          <div className="flex items-center gap-10 px-4">
            <div className="flex flex-col">
              <h5>Customer Name</h5>
              <Input value={customerName} className="w-full max-w-screen-2xl" readOnly />
            </div>
            <div className="flex flex-col">
              <h5>Contact Number</h5>
              <Input value={contactNumber} className="w-full max-w-screen-2xl" readOnly />
            </div>
            <div className="flex flex-col">
              <h5>Post Date</h5>
              <DatePicker className="w-full max-w-screen-2xl" value={postDate} onChange={setPostDate} placeholder="Select date" />
            </div>
            <div className="flex flex-col">
              <h5>Due Date</h5>
              <DatePicker className="w-full max-w-screen-2xl" value={dueDate} onChange={setDueDate} placeholder="Select date" />
            </div>
          </div>
        </Card>

        {/* Product and Cart Section */}
        <Card shadow="sm" className="flex flex-col gap-5 px-4 py-4">
          <div className="flex items-center gap-10 px-4">
            <div className="flex flex-col">
              <h5>SKU</h5>
              <Autocomplete
                // label="Select Product"
                value={selectedProduct}
                items={productAutocompleteList}
                className="h-10"
                onInputChange={handleProductSelect}
              >
                {productAutocompleteList.map((item, index) => (
                  <AutocompleteItem key={index} value={item}>
                    {item}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>
            <div className="flex flex-col">
              <h5>Product Name</h5>
              <Input value={productName} readOnly />
            </div>
            <div className="flex flex-col">
              <h5>Quantity</h5>
              <Input type="number" value={quantity} 
              onChange={(e) => 
               { handleQtyChange(Number(e.target.value));
                setQuantity(Number(e.target.value))}} min={0} max={maxQty} />
            </div>
            <div className="flex flex-col">
              <h5>Discount</h5>
              <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} min={0} />
            </div>
          </div>
          <Button color="secondary" onClick={handleAddToCart} className="w-full px-4">
            Add to Cart
          </Button>

          {/* Cart Table */}
          <Table aria-label="Cart Table">
            <TableHeader>
              <TableColumn>SKU</TableColumn>
              <TableColumn>Product</TableColumn>
              <TableColumn>Quantity</TableColumn>
              <TableColumn>Discount</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>Discounted Price</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {cart.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>LKR {item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    LKR {((item.price ?? 0) * (1 - (item.discount ?? 0) / 100) * (item.quantity ?? 0)).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button variant="light" color="danger" onClick={() => handleRemoveFromCart(index)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Right Section: Cart Summary */}
      <div className="w-full md:w-1/3">
        <Card shadow="sm" className="flex flex-col gap-5 px-4 py-4">
          <h5 className="font-bold text-lg">Cart Summary</h5>
          {cart.length === 0 && <h4>No items in cart</h4>}
          <div>
            <h4 className="font-bold">Total: LKR {cartTotal}</h4>
            <Select
              label="Payment Method"
              selectedKeys={paymentMethod}
              onSelectionChange={setPaymentMethod}
            >
              <SelectItem key="cash">Cash</SelectItem>
              <SelectItem key="card">Card</SelectItem>
              <SelectItem key="online">Online</SelectItem>
            </Select>
          </div>
          <Button onClick={handleCheckout} color="secondary">
            Checkout
          </Button>
        </Card>
      </div>
    </div>
  </div>
</div>
 {/* Checkout Modal */}
 <Modal isOpen={checkoutModalOpen}
      onClose={() => setCheckoutModalOpen(false)}
      size= "xl">
        <ModalContent>
        <ModalHeader>
          <h3 id="modal-title">Invoice</h3>
        </ModalHeader>
        <ModalBody>
          <div ref={modalRef} dangerouslySetInnerHTML={{ __html: renderInvoiceTemplate() }} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={generatePDF} color="secondary" fullWidth>
            Export as PDF
          </Button>
        </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}