"use client";

import React, { useState, useEffect } from "react";
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
  Select,
  SelectItem,
} from "@nextui-org/react";
import { IconX, IconEdit, IconTrashX } from "@tabler/icons-react";
import API_ENPOINTS from "../../API";
import config from "../../config";
import { Group } from "@mantine/core";

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

export default function ProductPage() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [products, setProducts] = useState<Product[]>([]);
  const [viewEditItem, setViewEditItem] = React.useState(false);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [viewAddModal, setViewAddModal] = useState(false);
  const [viewEditModal, setViewEditModal] = useState(false);
  const [viewDelete, setViewDelete] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    sku: "",
    name: "",
    category: "",
    quantity: 0,
    cost: 0,
    price: 0,
    maxDiscount: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [showMaxDiscount, setShowMaxDiscount] = React.useState(false);
  const [prodCat,setProdCat]= useState(new Set([]));

  const showErrorNotification = (message: string) => {
    // Replace with your UI notification logic
    console.error("Notification:", message);
  };

  const validateForm = () => {
    if  (!formValues.name || !formValues.category) {
      showErrorNotification("Please fill all required fields.");
      return false;
    }
    return true;
  };

  const loadProducts = async () => {
    try {
      console.log("Loading products...");
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      console.log("Products loaded successfully:", response.data);
      if (Array.isArray(response.data)) {
        setProducts(response.data);
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
      console.log("Loading product categories...");
      const response = await axios.get(API_ENPOINTS.GET_PRODUCT_CATEGORIES);
      console.log("Categories loaded successfully:", response.data);
      if (response.status === 200 && response.data.success) {
        const categories = response.data.data.map(
          (category: Category) => category.Category
        );
        setProductCategories(categories);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading product categories:", error);
      showErrorNotification("Error loading product categories");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("File selected:", file);
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleAddProduct = async () => {
    if (!validateForm()) return;

    try {
      console.log("Adding product with values:", formValues);
      let imageUrl = "";

      if (selectedFile) {
        console.log("Uploading image...");
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadResponse = await axios.post(
          API_ENPOINTS.UPLOAD_PRODUCT_IMAGE,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("Image uploaded successfully:", uploadResponse.data);
        imageUrl = uploadResponse.data.url;
      }

      const response = await axios.post(API_ENPOINTS.ADD_PRODUCT, {
        ...formValues,
        image: imageUrl,
      });
      console.log("Product added successfully:", response.data);

      setViewAddModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      showErrorNotification("Error adding product");
    }
  };

  const handleEditProduct = async () => {
    if (!validateForm()) return;

    try {
      console.log("Editing product ID:", editingProductId, "Values:", formValues);
      let imageUrl = imagePreview;

      if (selectedFile) {
        console.log("Uploading new image...");
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadResponse = await axios.post(
          API_ENPOINTS.UPLOAD_PRODUCT_IMAGE,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("New image uploaded successfully:", uploadResponse.data);
        imageUrl = uploadResponse.data.url;
      }

      const response = await axios.put(API_ENPOINTS.UPDATE_PRODUCT, {
        ...formValues,
        id: editingProductId,
        image: imageUrl,
      });
      console.log("Product updated successfully:", response.data);

      setViewEditModal(false);
      setEditingProductId(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Error editing product:", error);
      showErrorNotification("Error editing product");
    }
  };

  const hadleDeleteConfirm = async (product: Product) => {
    console.log("Set Delete");
    setViewDelete(true);
    setSelectedProduct(product);
  };
  
  const handleEditViewModal = (product: Product) => {
    setViewEditItem(true);
    setEditingProduct(product);
    setOriginalImage(product.image || null);
    setFormValues({
      sku: product.sku,
      name: product.productName,
      category: product.category,
      quantity: product.intQty,
      cost: product.cost,
      price: product.price,
      maxDiscount: product.maxDiscount,
    });
    setImagePreview(product.image || null);
  };

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
  const handleCategoryChange = (keys: Set<string>) => {
    const selectedCategory = Array.from(keys)[0]; // Convert Set to array and get the first item
    setProdCat(keys);
    setFormValues((prevValues) => ({
      ...prevValues,
      category: selectedCategory,
    }));
  };

  const resetForm = () => {
    setFormValues({
      sku: "",
      name: "",
      category: "",
      quantity: 0,
      cost: 0,
      price: 0,
      maxDiscount: 0,
    });
    setImagePreview(null);
    setSelectedFile(null);
    setProdCat(new Set([]));
    setShowMaxDiscount(false);
  };

  useEffect(() => {
    loadProducts();
    loadProductCategories();
  }, []);

  return (
    <div>
      {/* <h1>Products</h1>
      <Button
  onPress={() => { onOpen;
    console.log("Opening Add Product Modal");
    setViewAddModal(true);
  }}
>
  Add Product
</Button> */}


<div
                className="sticky top-0 overflow-hidden h-fit w-full items-center justify-between rounded-t-2xl bg-white px-4 pb-[20px] pt-4 shadow-2xl shadow-gray-100 dark:!bg-navy-700 dark:shadow-none"
                >
                <h1 className="text-3xl font-bold text-purple-800 dark:text-white">
                Products
                </h1>
                <button
                    className=" absolute top-4 right-0 linear rounded-[20px] bg-purple-400 px-4 py-2 text-base font-medium text-brand-500 transition duration-200  hover:bg-purple-500 active:bg-purple-500 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20"
                    onClick={() => { onOpen;
                      console.log("Opening Add Product Modal");
                      setViewAddModal(true);
                    }}
               
               >
                    Add Product
                </button>
                </div>

                <div className="container absolute inset-25 w-full max-w-[1375px]">
      <Table className="text-center w-full max-h-[700px]">
        <TableHeader className="sticky top-0 overflow-hidden w-full mb-4">
          <TableColumn className="p-4 w-1/6">SKU</TableColumn>
          <TableColumn className="p-4 w-1/6">Product Name</TableColumn>
          <TableColumn className="p-4 w-1/8">Product Image</TableColumn>
          <TableColumn className="p-4 w-1/8">Category</TableColumn>
          <TableColumn className="p-4 w-1/8">Quantity</TableColumn>
          <TableColumn className="p-4 w-1/8">Cost Price</TableColumn>
          <TableColumn className="p-4 w-1/8">Selling Price</TableColumn>
          <TableColumn className="p-4 w-1/8">Max Discount</TableColumn>
          <TableColumn className="p-4 w-1/8">Stock Status</TableColumn>
          <TableColumn className="p-4 w-1/4" children={undefined}></TableColumn>
        </TableHeader>
        <TableBody className="overflow-y-auto" >
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{product.image ? (
            <Image radius="md" height={50} src={product.image} style={{ border: "1px solid #dee2e6" }} />
          ) : (
            <Badge color="default">No Image</Badge>
          )}</TableCell>
            <TableCell>{product.sku}</TableCell>
              <TableCell>{product.productName}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.intQty}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.maxDiscount}</TableCell>
              <TableCell
              style={{
                display: "flex",
            gap: "5px",
            justifyContent: "end",
            padding: "10px",
            }}
            className="flex flex-wrap gap-1 items-center"
                  >
          {product.intQty === config.OUT_OF_STOCK ? (
            <Chip color="danger">Out of Stock</Chip>
          ) : product.intQty < config.LOW_STOCK ? (
            <Chip color="warning">Low in Stock</Chip>
          ) : (
            <Chip color="success">In Stock</Chip>
          )}
              </TableCell>
              <TableCell>
                <div className="grid gap-4 grid-cols-2">
              <Button onClick={() => handleEditViewModal(product)} title="Edit Product" className="flex flex-wrap gap-1 items-center">
            <IconEdit />
          </Button>
          <Button color="secondary" onClick={() => hadleDeleteConfirm(product)} title="Delete Product" className="flex flex-wrap gap-1 items-center">
            <IconTrashX />
          </Button>
          </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={viewAddModal} 
      onOpenChange={onOpenChange}
      onClose={() => setViewAddModal(false)}>
        <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Add Product</ModalHeader>
        <ModalBody>
          {/* <Input label="Product Code" name="sku" value={formValues.sku} onChange={handleInputChange} /> */}
          <Input label="Product Name" name="name" value={formValues.name} onChange={handleInputChange} />
          <div className="flex flex-row space-x-4">
        <div className="relative z-0 w-full mb-5">
          {/* <Input label="Category" name="category" value={formValues.category} onChange={handleInputChange} /> */}
          <Select
  className="max-w-xs"
  label="Product Categories"
  selectedKeys={prodCat}
  onSelectionChange={handleCategoryChange}
>
  {productCategories.map((productCat) => {
    console.log(productCat);
    return <SelectItem key={productCat}>{productCat}</SelectItem>;
  })}
</Select>
          </div>
          <div className="relative z-0 w-full mb-5">
          <Input type="number" label="Quantity" name="quantity" value={formValues.quantity} onChange={handleInputChange} />
         
          </div>
          </div>
          <div className="flex flex-row space-x-4">
          <div className="relative z-0 w-full mb-5">
          <Input type="number" label="Cost" name="cost" value={formValues.cost} onChange={handleInputChange} />
          </div>
          <div className="relative z-0 w-full mb-5">
          <Input type="number" label="Price" name="price" value={formValues.price} onChange={handleInputChange} />
          </div>
          </div>
          <div className="flex flex-row space-x-4">
          <div className="relative z-0 w-full mb-5">
          <Switch color="secondary"
          checked={showMaxDiscount} 
          onChange={() => setShowMaxDiscount((prev) => !prev)}
          >
        Max Discount
      </Switch>
          </div>
          <div className="relative z-0 w-full mb-5">
          {showMaxDiscount && <Input
            type="number"
            label="Max Discount"
            name="maxDiscount"
            value={formValues.maxDiscount}
            onChange={handleInputChange}
          />}
          </div>
          </div>
          <Input type="file" onChange={handleFileChange} />
          {imagePreview && <Image src={imagePreview} alt="Preview" />}
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleAddProduct}>Save</Button>
          <Button color="secondary" onClick={() => setViewAddModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
        </ModalContent>
      </Modal>
    
    {/* Add Product Modal */}
    <Modal isOpen={viewEditItem} 
      onOpenChange={onOpenChange}
      onClose={() => setViewEditItem(false)}>
        <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Add Product</ModalHeader>
        <ModalBody>
          <Input label="Product Code" name="sku" value={formValues.sku} onChange={handleInputChange} readOnly/>
          <Input label="Product Name" name="name" value={formValues.name} onChange={handleInputChange} />
          <Input label="Category" name="category" value={formValues.category} onChange={handleInputChange} />
          <Input type="number" label="Quantity" name="quantity" value={formValues.quantity} onChange={handleInputChange} />
          <Input type="number" label="Cost" name="cost" value={formValues.cost} onChange={handleInputChange} />
          <Input type="number" label="Price" name="price" value={formValues.price} onChange={handleInputChange} />
          <Input
            type="number"
            label="Max Discount"
            name="maxDiscount"
            value={formValues.maxDiscount}
            onChange={handleInputChange}
          />
          <Input type="file" onChange={handleFileChange} />
          {imagePreview && <Image src={imagePreview} alt="Preview" width={50}
      height={50}
      />}
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleEditProduct}>Update </Button>
          <Button color="secondary" onClick={() => setViewEditItem(false)}>
            Cancel
          </Button>
        </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={viewDelete}
        onClose={() => setViewDelete(false)}
        title="Delete product"
        size="lg"
      >
        <ModalContent>
        <ModalBody>
        <p>Are you sure you want to delete this product?</p>
        <div justify="flex-end" mt="md">
          <Button onClick={() => setViewDelete(false)} color="default">
            Close
          </Button>
          <Button onClick={handleDeleteProceed} color="secondary">
            Delete
          </Button>
        </div>
        </ModalBody>
        </ModalContent>
      </Modal>

    </div>
  );
}