import {
  Badge,
  Button,
  FileInput,
  Flex,
  Group,
  Image,
  Modal,
  Select,
  Table,
  Switch,
  TextInput,
} from "@mantine/core";
import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import API_ENPOINTS from "../../API";
import config from "../../config";
import Tooltip from '@mui/material/Tooltip'; // eslint-disable-line
import {
  IconEdit,
  IconEditCircle,
  IconSquareRoundedPlus, // eslint-disable-line
  IconTrashX,
} from "@tabler/icons-react";

interface Product {
  id: number;
  sku: string;
  productName: string;
  category: string;
  intQty: number;
  cost: number;
  price: number;
  image?: string;
  maxDiscount: number;
}

interface Category {
  id: number;
  Category: string;
  status: number;
}

const Products: React.FC = () => {
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [viewEditItem, setViewEditItem] = React.useState(false);
  const [viewDelete, setViewDelete] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [productCategories, setProductCategories] = React.useState<string[]>([]);
  const [productTblRows, setProductTblRows] = React.useState<JSX.Element[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null); // eslint-disable-line
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [showMaxDiscount, setShowMaxDiscount] = React.useState(false);
  const [maxDiscount, setMaxDiscount] = React.useState(0); 

  const showErrorNotification = (message: string) => {
    showNotification({
      title: "Error",
      message,
      icon: <IconX size={18} />,
      color: "red",
    });
  }

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      console.log(response.data);
      if (Array.isArray(response.data)) {
        setProducts(response.data); // Assuming the response contains an array of products
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      showErrorNotification("Error loading products");
    }
  };

  const loadProductCategories = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCT_CATEGORIES);
  
      // Ensure response is valid and contains the expected structure
      if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
        const categoriesList = response.data.data.map((category: Category) => category.Category);
        setProductCategories(categoriesList);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error: any) { // eslint-disable-line
      console.error("Error loading product categories:", error.message || error);
      showErrorNotification("Error loading product categories")
    }
  };
  

  const hasImageChanged = () => {
    return selectedFile !== null || imagePreview !== originalImage;
  };

  const form = useForm({
    initialValues: {
      procode: "",
      proname: "",
      category: "",
      quantity: null,
      price: null,
      cost: null,
      maxDiscount:0,
    },
    validate: {
      proname: (value) => (value ? null : "Product name is required"),
    },
  });

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setSelectedFile(null);
    }
  };

  const handleUpdateProduct = async (values: typeof form.values) => { 
    let { procode, proname, category, quantity, price, cost,maxDiscount } = values; // eslint-disable-line
    let imageUrl = originalImage;

    try {
      if (hasImageChanged() && selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadResponse = await axios.post(
          API_ENPOINTS.UPLOAD_PRODUCT_IMAGE,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        imageUrl = uploadResponse.data.url;
      }
      if(maxDiscount === null){
        maxDiscount=0;
      }
      await axios.put(API_ENPOINTS.UPDATE_PRODUCT, {
        sku: procode,
        name: proname,
        category,
        quantity,
        price,
        cost,
        image: imageUrl,
        maxDiscount: maxDiscount,
      });

      form.reset();
      setViewEditItem(false);
      setImagePreview(null);
      loadProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProduct = async (values: typeof form.values) => {
   
    const { procode, proname, category, quantity, price, cost, maxDiscount } = values;
    let imageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const uploadResponse = await axios.post(
          API_ENPOINTS.UPLOAD_PRODUCT_IMAGE,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        imageUrl = uploadResponse.data.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    }

    try {
      await axios.post(API_ENPOINTS.ADD_PRODUCT, {
        sku: procode,
        name: proname,
        category,
        quantity,
        price,
        cost,
        image: imageUrl || "",
        maxDiscount,
      });

      form.reset();
      setViewAddItem(false);
      setImagePreview(null);
      setSelectedFile(null);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      showErrorNotification("Error saving product");
    }
  };

  const handleEditViewModal = (product: Product) => {
    setViewEditItem(true);
    setEditingProduct(product);
    setOriginalImage(product.image || null);
    form.setValues({
      procode: product.sku,
      proname: product.productName,
      category: product.category,
      quantity: product.intQty,
      cost: product.cost,
      price: product.price,
      maxDiscount: product.maxDiscount
    });
    setImagePreview(product.image || null);
  };

  const hadleDeleteConfirm = async (product: Product) => {
    setViewDelete(true);
    setSelectedProduct(product);
  };

  useEffect(() => {
    console.log("Products state updated:", products); 
    const rows = products.map((product) => (
      <Table.Tr key={product.sku}>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>{product.sku}</Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>{product.productName}</Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.image ? (
            <Image radius="md" height={50} fit="contain" src={product.image} style={{ border: "1px solid #dee2e6" }} />
          ) : (
            <Badge color="gray">No Image</Badge>
          )}
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>{product.category}</Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>{product.intQty}</Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>LKR {product.cost.toFixed(2)}</Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>LKR {product.price.toFixed(2)}</Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>{product.maxDiscount}%</Table.Td>
        <Table.Td
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "end",
            padding: "10px",
          }}
        >
          {product.intQty === config.OUT_OF_STOCK ? (
            <Badge color="red">Out of Stock</Badge>
          ) : product.intQty < config.LOW_STOCK ? (
            <Badge color="yellow">Low in Stock</Badge>
          ) : (
            <Badge color="green">In Stock</Badge>
          )}
        </Table.Td>
        <Table.Td style={{ display: "flex", gap: "5px", justifyContent: "end", padding: "10px" }}>
          <Button onClick={() => handleEditViewModal(product)} title="Edit Product">
            <IconEdit />
          </Button>
          <Button color="red" onClick={() => hadleDeleteConfirm(product)} title="Delete Product">
            <IconTrashX />
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

    setProductTblRows(rows);
  }, [products]); // eslint-disable-line

  useEffect(() => {
    loadProductCategories();
    loadProducts();
  }, []); // eslint-disable-line

  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>SKU</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Product Name</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Product Image</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Category</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Quantity</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Cost Price</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Selling Price</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Max Discount</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Stock Status</Table.Th>
      <Table.Th></Table.Th>
    </Table.Tr>
  );


  const handleDeleteProceed = async () => {
    try {
      await axios.delete(`${API_ENPOINTS.DELETE_PRODUCT}`, {
        data: { id: selectedProduct?.id }  // Send the product ID in the request body
      });
      setViewDelete(false);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      showErrorNotification("Error deleting product:");
    }
  };
  
  return (
    <div>
      <Modal
        opened={viewDelete}
        onClose={() => setViewDelete(false)}
        title="Delete product"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <p>Are you sure you want to delete this product?</p>
        <Group justify="flex-end" mt="md">
          <Button onClick={() => setViewDelete(false)} color="gray">
            Close
          </Button>
          <Button onClick={handleDeleteProceed} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add new product"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
      <form onSubmit={form.onSubmit(handleAddProduct)}>
  <Group>
    <TextInput
      style={{ width: "100%" }}
      withAsterisk
      label="Product Name"
      placeholder="Product Name"
      {...form.getInputProps("proname")}
    />
  </Group>
  
  <Group>
    <Select
      label="Category"
      placeholder="Pick value"
      data={productCategories}
      {...form.getInputProps("category")}
      style={{ width: "45%", marginRight: "4%" }}
    />
    <TextInput
      withAsterisk
      label="Quantity"
      placeholder="Quantity"
      type="number"
      {...form.getInputProps("quantity")}
      style={{ width: "45%", marginLeft: "2%" }}
    />
  </Group>

  <Group>
    <TextInput
      withAsterisk
      label="Cost"
      placeholder="Cost"
      type="number"
      step="0.01"
      {...form.getInputProps("cost")}
      style={{ width: "45%", marginRight: "4%" }}
    />
    <TextInput
      withAsterisk
      label="Price"
      placeholder="Price"
      type="number"
      step="0.01"
      {...form.getInputProps("price")}
      style={{ width: "45%" , marginLeft: "2%" }}
    />
  </Group>

  <Group>
    <Switch 
      checked={showMaxDiscount} 
      onChange={() => setShowMaxDiscount((prev) => !prev)}
      label={"Max Discount"}
      style={{ width: "45%" , marginRight: "5%", marginTop: "4%" }}
      step="0.01"
    />
    {showMaxDiscount && (
      <TextInput
        type="number"
        value={maxDiscount}
        onChange={(e) => setMaxDiscount(parseInt(e.target.value, 10))}
        label="Set Max Discount (%)"
        placeholder="Enter max discount"
        {...form.getInputProps("maxDiscount")}
        style={{ marginLeft:  "2%", width: "42%" , marginTop: "2%"}}
         step="0.01"
      />
    )}
  </Group>

  <FileInput
    variant="filled"
    size="md"
    radius="lg"
    label="Product Image"
    description="Upload .jpg or .png image"
    placeholder="No file selected"
    onChange={handleFileChange}
    style={{ marginTop: "1rem", width: "100%" }}
  />

  {imagePreview && (
    <Image
      radius="md"
      className="image-preview"
      src={imagePreview}
      alt="Image preview"
      height={300}
      width={300}
      style={{ marginTop: "1rem" }}
    />
  )}

  <Group justify="flex-start" mt="md">
    <Button type="submit" color="green">
      Add
    </Button>
    <Button onClick={() => setViewAddItem(false)} color="gray" style={{ marginLeft: "1rem" }}>
      Close
    </Button>
  </Group>
</form>

      </Modal>
      <Modal
        opened={viewEditItem}
        onClose={() => setViewEditItem(false)}
        title={
          <Group>
            <IconEditCircle size={20} />
            <span className="modal-header-text">Edit Product</span>
          </Group>
        }
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleUpdateProduct)}>
  <Group direction="column" grow>
    <TextInput
      withAsterisk
      label="Product Code"
      placeholder="SKU00001"
      {...form.getInputProps("procode")}
      readOnly
    />
    <TextInput
      style={{ width: "100%" }}
      withAsterisk
      label="Product Name"
      placeholder="Product Name"
      {...form.getInputProps("proname")}
    />
  </Group>

  <Group direction="row" grow>
    <Select
      label="Category"
      placeholder="Pick value"
      data={productCategories}
      {...form.getInputProps("category")}
      style={{ flex: 1 }} // Ensures the Select takes full available space
    />
    <TextInput
      withAsterisk
      label="Quantity"
      placeholder="Quantity"
      type="number"
      {...form.getInputProps("quantity")}
      style={{ flex: 1 }} // Ensures the Quantity input takes full available space
    />
  </Group>

  <Group direction="row" grow>
    <TextInput
      withAsterisk
      label="Cost"
      placeholder="Cost"
      type="number"
      step="0.01"
      {...form.getInputProps("cost")}
      style={{ flex: 1 }} // Ensures the Cost input takes full available space
    />
    <TextInput
      withAsterisk
      label="Price"
      placeholder="Price"
      type="number"
      step="0.01"
      {...form.getInputProps("price")}
      style={{ flex: 1 }} // Ensures the Price input takes full available space
    />
  </Group>
  
  <Group>
    <Switch 
      checked={showMaxDiscount} 
      onChange={() => setShowMaxDiscount((prev) => !prev)}
      label={"Max Discount"}
      style={{ width: "45%" , marginRight: "5%", marginTop: "4%" }}
      step="0.01"
    />
    {showMaxDiscount && (
      <TextInput
        type="number"
        value={maxDiscount}
        onChange={(e) => setMaxDiscount(parseInt(e.target.value, 10))}
        label="Set Max Discount (%)"
        placeholder="Enter max discount"
        {...form.getInputProps("maxDiscount")}
        style={{ marginLeft:  "2%", width: "42%" , marginTop: "2%"}}
         step="0.01"
      />
    )}
  </Group>

  <FileInput
    variant="filled"
    size="md"
    radius="lg"
    label="Product Image"
    description="Upload .jpg or .png image"
    placeholder="No file selected"
    onChange={handleFileChange}
  />

  {imagePreview && (
    <Image
      radius="md"
      src={imagePreview}
      alt="Image preview"
      height={100}
      width={100}
      style={{ marginTop: "1rem" }}
    />
  )}

  <Group justify="flex-start" mt="md">
    <Button type="submit" color="green" style={{ marginRight: "1rem" }}>
      Update
    </Button>
    <Button onClick={() => setViewEditItem(false)} color="red">
      Close
    </Button>
  </Group>
</form>

      </Modal>
      {/* <Notification icon={<CheckIcon />} color="teal" title="All good!" mt="md">
        Everything is fine
      </Notification> */}
      <Flex justify="space-between" align="center">
        <h4>Products</h4>
        <Button onClick={() => setViewAddItem(true)} color="green">
          Add New Product 
        </Button>
      </Flex>
      <div style={{ overflowX: "auto", maxHeight: "700px" }}>
      <Table striped highlightOnHover>
        <Table.Thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>{headers}</Table.Thead>
        <Table.Tbody>{productTblRows}</Table.Tbody>
      </Table>
      </div>
    </div>
  );
};

export default Products;