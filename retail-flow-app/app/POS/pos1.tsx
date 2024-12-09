import {
  Button,
  Autocomplete,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState,useRef } from "react";
import { DateInput } from "@mantine/dates";
import axios, { AxiosResponse } from "axios";
import API_ENPOINTS from "../../API";
import '@mantine/dates/styles.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import emailjs from 'emailjs-com';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image'; // eslint-disable-line
 



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

const POS1: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // eslint-disable-line
  const [productsDataSet, setProductsDataSet] = useState<any>([]); // eslint-disable-line
  const [productAutocompleteList, setProductAutocompleteList] = useState<any>([]); // eslint-disable-line
  const [invoiceItemsList, setInvoiceItemsList] = useState<any>([]); // eslint-disable-line
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Date | null>(null); // eslint-disable-line
  const [postDate, setPostDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [sku, setSKU] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [customerDataSet, setcustomerDataSet] = useState<any>([]); // eslint-disable-line
  const [customerName, setcustomerName] = useState<any>([]); // eslint-disable-line
  const [contactNumber, setcontactNumber] = useState<any>([]); // eslint-disable-line
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>(""); // eslint-disable-line
  const [maxQty, setMaxQty] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState<any>([]); // eslint-disable-line

  const customStyles = { // eslint-disable-line
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxHeight: "90vh",
      overflowY: "auto",
      border: "2px solid #0044cc",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  };


  // const handleAddToCart = () => {
  //   if (selectedProduct) {
  //     setCart((prev) => [...prev, { ...selectedProduct, quantity, discount }]);
  //     setQuantity(0);
  //     setSelectedProduct(null);
  //     setProductName("");
  //     setSKU("");
  //     setDiscount(0);
  //   } else {
  //     alert("Please select a product.");
  //   }
  // };

  const handleAddToCart = () => {


    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }
    console.log(selectedProduct)
    // Find if the product already exists in the cart
    const existingProduct = cart.find((item) => item.id === selectedProduct.id);
  
    // Calculate the total quantity after the addition
    const totalQuantity = existingProduct
      ? existingProduct.quantity + quantity
      : quantity;
  
    // Check if the total exceeds the maximum allowed quantity
    console.log
    if (totalQuantity > maxQty) {
      alert(`Cannot add more than ${maxQty} of ${selectedProduct.productName}`);
      return; // Prevent adding to the cart
    }
  
    // Update the cart
    setCart((prev) => {
      if (existingProduct) {
        // Update the quantity for the existing product
        return prev.map((item) =>
          item.id === selectedProduct.id
            ? { ...item, quantity: item.quantity + quantity}
            : item
        );
      } else {
        // Add the new product to the cart
        return [...prev, { ...selectedProduct, quantity, discount }];
      }
    });
  
    // Reset the form fields
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

  const handleConfirmCheckout = async () => { // eslint-disable-line
    let response: AxiosResponse<any, any>; // eslint-disable-line
    try {
      console.log(cart);
      const updatePayload = cart.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));
  
      console.log(updatePayload);
      response = await axios.put(API_ENPOINTS.UPDATE_INVENTORY, { products: updatePayload }); // eslint-disable-line
  
      alert("Checkout confirmed. Inventory updated successfully.");
      setCart([]);
      setCheckoutModalOpen(false);
      setcontactNumber("");
      setcustomerName("");
    } catch (error) {
      console.error("Error response:", error.response.data.message);
      alert("Failed to update inventory. Please try again." +  error.response.data.message);
    }
  };

  const handleProductSelect = (sku: string) => {
    sku =sku.split(' ')[0]
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setSelectedProduct(product);
      setProductName(product.productName);
      setSKU(product.sku);
    }
  };
  const handleCustomerSelect = (contact: string) => {
    const customer = customerDataSet.find((p) => p.contact === contact);
    if (customer) {
      setSelectedCustomer(customer);
      setcustomerName(customer.name);
      setcontactNumber(customer.contact);
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
    const product = productsDataSet.find((p) => p.sku === sku);
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
    .reduce((acc, item) => acc + calculateDiscountedPrice(item.price, item.discount ) * (item.quantity), 0)
    .toFixed(2);

    const loadProducts = async () => {
      try {
        const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
        const products = response.data;
        console.log(products)
    
        // Filter products with quantity > 0
        const availableProducts = products.filter((product: any) => product.intQty > 0); // eslint-disable-line
        console.log(availableProducts)
    
        // Map the filtered products to their SKUs
        const SKU = availableProducts.map((element: any) => element.sku); // eslint-disable-line
    
        // Update state
        setProductsDataSet(products);
        const autocompleteList = availableProducts.map((element: any) => `${element.sku} ${element.productName}`); // eslint-disable-line
        setProductAutocompleteList(autocompleteList);
        // setProductAutocompleteList(SKU);
      } catch (error) {
        console.log(error);
      }
    };

  const loadCustomer = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_CUSTOMERS);
      const customer = response.data;
      setcustomerDataSet(customer);
    } catch (error) {
      console.log(error);
    }
  };

  const saveCheckoutAsPNG = async () => { // eslint-disable-line
    if (!modalRef.current) {
      alert("Modal content not available for rendering.");
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(modalRef.current);
      const link = document.createElement("a");
      link.download = "checkout_summary.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error capturing modal as PNG:", error);
      alert("Failed to save as PNG.");
    }
  };


  const sendEmail = (event: React.FormEvent) => { // eslint-disable-line
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
      const dataUrl = await htmlToImage.toPng(modalRef.current);
      if (!dataUrl) return alert("Failed to generate image.");
  
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      // Calculate image height to fit the page width
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width; // eslint-disable-line
  
      // Add the first page with content
      let position = 0;
      const maxHeight = pageHeight - 20; // Adjust for some margin
  
      // Loop to add content, breaking into pages when necessary
      while (position < imgProps.height) {
        const currentPageHeight = Math.min(imgProps.height - position, maxHeight);
  
        pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, currentPageHeight);
  
        position += currentPageHeight;
  
        // Only add a new page if there is more content to display
        if (position < imgProps.height) {
          pdf.addPage();
        }
      }
  
      // Save the PDF
      pdf.save(`Invoice_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  
  

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
                <td><b>Date:</b> ${postDate ? postDate.toDateString() : "N/A"} | <b>Due On:</b> ${dueDate ? dueDate.toDateString() : "N/A"}</td>
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


  useEffect(() => {
    loadProducts();
    loadCustomer();
  }, []);

  return (
<Container fluid>
  <Grid>
    <Grid.Col span={12}>
      <Card padding="lg" shadow="sm">
        <Grid>
          <Grid.Col span={4}>
            <Text size="lg" weight={500}>Search</Text>
            <Autocomplete
              data={customerDataSet.map((customer: Customer) => `${customer.contact} ${customer.name}`)}
              value={search}
              onChange={(val) => {
                setSearch(val);
                handleCustomerSelect(val);
                setcustomerName(val.split(' ')[1]);
                setcontactNumber(val.split(' ')[0]);
              }}
              placeholder="Contact Number"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="lg" weight={500}>Customer Name</Text>
            <TextInput value={customerName} placeholder="Customer Name" readOnly />
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="lg" weight={500}>Contact Number</Text>
            <TextInput value={contactNumber} placeholder="Contact Number" readOnly />
          </Grid.Col>
        </Grid>
      </Card>
    </Grid.Col>

    <Grid.Col span={12}>
      <Card padding="lg" shadow="sm">
        <Grid>
          <Grid.Col span={6}>
            <Text size="lg" weight={500}>Post Date</Text>
            <DateInput value={postDate} onChange={setPostDate} placeholder="Select date" />
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="lg" weight={500}>Due Date</Text>
            <DateInput value={dueDate} onChange={setDueDate} placeholder="Select date" />
          </Grid.Col>
        </Grid>
      </Card>
    </Grid.Col>

    <Grid.Col span={8}>
      <Card padding="lg" shadow="sm">
        <Stack spacing="sm">
          <Grid>
            <Grid.Col span={3}>
              <Text size="lg" weight={500}>SKU:</Text>
              <Autocomplete
                data={productAutocompleteList}
                value={sku}
                onChange={(val) => {
                  setSKU(val);
                  handleProductSelect(val);
                }}
                placeholder="Select SKU"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Text size="lg" weight={500}>Product Name:</Text>
              <TextInput value={productName} readOnly />
            </Grid.Col>
            <Grid.Col span={2}>
              <Text size="lg" weight={500}>Qty:</Text>
              <NumberInput
                value={quantity}
                onChange={(val) => {
                  handleQtyChange(val);
                  setQuantity(val);
                }}
                min={0}
                max={maxQty}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Text size="lg" weight={500}>Discount:</Text>
              <NumberInput
                value={discount}
                onChange={handleDiscountChange}
                min={0}
                max={maxDiscount}
              />
            </Grid.Col>
          </Grid>
          <Button color="green" onClick={handleAddToCart}>Add to Cart</Button>
        </Stack>

        <Table
  striped
  highlightOnHover
  withBorder
  style={{
    tableLayout: "fixed",
    width: "100%",
    maxWidth: "auto", // Adjust width as needed
    height: "400px", // Adjust height as needed
    overflow: "hidden", // Prevents the table itself from stretching
  }}
>
<div style={{ overflowY: "auto", maxHeight: "400px",maxWidth: "auto" }}>
<table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Discount</th>
              <th>Price</th>
              <th>Discounted Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}>
                <td>{item.sku}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.discount}%</td>
                <td>LKR {item.price.toFixed(2)}</td>
                <td>LKR {(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 0)).toFixed(2)}</td>
                <td>
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => handleRemoveFromCart(index)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
  </div>
</Table>
      </Card>
    </Grid.Col>

    <Grid.Col span={4}>
      <Card padding="lg" shadow="sm">
        <Text size="lg" weight={500}>Cart Summary</Text>
        {cart.length === 0 && <Text>No items in cart</Text>}
        <Stack spacing="xs">
          <Group position="apart">
            <Text weight={500}>Total:</Text>
            <Text weight={500}>LKR {cartTotal}</Text>
          </Group>
        </Stack>
        <Select
          label="Payment Method"
          value={paymentMethod}
          onChange={setPaymentMethod}
          data={[
            { value: "cash", label: "Cash" },
            { value: "card", label: "Card" },
            { value: "online", label: "Online" },
          ]}
          mt="md"
        />
        <Button onClick={handleCheckout} fullWidth mt="md">
          Checkout
        </Button>
      </Card>
    </Grid.Col>
  </Grid>

  <Modal
    opened={checkoutModalOpen}
    onClose={() => setCheckoutModalOpen(false)}
    size= "xl"
  >
    <div ref={modalRef} dangerouslySetInnerHTML={{ __html: renderInvoiceTemplate() }} />
    <Button onClick={generatePDF} mt="md" fullWidth>
      Export as PDF
    </Button>
  </Modal>
</Container>

  );
};

export default POS1;  // eslint-disable-line