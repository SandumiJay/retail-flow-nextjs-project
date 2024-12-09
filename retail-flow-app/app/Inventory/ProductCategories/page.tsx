"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Badge,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spacer,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  ModalContent,
} from "@nextui-org/react";
import { IconEdit, IconTrashX, IconSquareRoundedPlus } from "@tabler/icons-react";
import API_ENPOINTS from "../../API";

export default function ProductCategoriesPage() {
  interface ProductCategory {
    id: string;
    Category: string;
    Status: number;
  }

  const [viewAddItem, setViewAddItem] = useState(false);
  const [viewEditItem, setViewEditItem] = useState(false);
  const [viewDelete, setViewDelete] = useState(false);
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState<string>("");
  const [productCategoryList, setProductCategoryList] = useState<ProductCategory[]>([]);
  const [categoryName, setCategoryName] = useState("");

  const loadProductCategories = async () => {
    try {
      const response = await axios.get<{ success: string; data: ProductCategory[] }>(
        API_ENPOINTS.GET_PRODUCT_CATEGORIES
      );
      setProductCategoryList(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteConfirm = (product: ProductCategory) => {
    setSelectedProductCategoryId(product.id);
    setViewDelete(true);
  };

  const handleDeleteProceed = async () => {
    try {
      await axios.delete(API_ENPOINTS.DELETE_PRODUCT_CATEGORY, {
        params: { id: selectedProductCategoryId },
      });
      setViewDelete(false);
      loadProductCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProductCategory = async () => {
    if (!categoryName.trim()) return alert("Category name cannot be empty!");
    try {
      await axios.post(API_ENPOINTS.CREATE_PRODUCT_CATEGORY, { category: categoryName });
      setCategoryName("");
      setViewAddItem(false);
      loadProductCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditProductCategory = (id: string) => {
    setSelectedProductCategoryId(id);
    const product = productCategoryList.find((p) => p.id === id);
    setCategoryName(product?.Category || "");
    setViewEditItem(true);
  };

  const handleUpdateProductCategory = async () => {
    if (!categoryName.trim()) return alert("Category name cannot be empty!");
    try {
      await axios.put(API_ENPOINTS.UPDATE_PRODUCT_CATEGORY, {
        id: selectedProductCategoryId,
        category: categoryName,
      });
      setCategoryName("");
      setViewEditItem(false);
      loadProductCategories();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProductCategories();
  }, []);

  const rows = productCategoryList.map((product) => (
    <TableRow key={product.id}>
      <TableCell style={{textAlign: "center" }} >{product.Category}</TableCell>
      <TableCell style={{textAlign: "center" }} >
        {product.Status === 1 ? (
          <Badge color="primary">Active</Badge>
        ) : (
          <Badge color="danger">Inactive</Badge>
        )}
      </TableCell>
      <TableCell style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
        {/* <Button onClick={() => handleEditProductCategory(product.id)}>
          <IconEdit />
        </Button>
        <Button color="danger" onClick={() => handleDeleteConfirm(product)}>
          <IconTrashX />
        </Button> */}
        
        <div className="grid gap-4 grid-cols-2">
              <Button onClick={() => handleEditProductCategory(product.id)} title="Edit Product" className="flex flex-wrap gap-1 items-center">
            <IconEdit />
          </Button>
          <Button color="secondary" onClick={() => handleDeleteConfirm(product)} title="Delete Product" className="flex flex-wrap gap-1 items-center">
            <IconTrashX />
          </Button>
          </div>
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={viewDelete} onClose={() => setViewDelete(false)}>
      <ModalContent>
        <ModalHeader>
          <h3>Delete Product Category</h3>
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete this product category?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDeleteProceed}>
            Delete
          </Button>
          <Button onClick={() => setViewDelete(false)}>Close</Button>
        </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Product Category Modal */}
      <Modal isOpen={viewAddItem} onClose={() => setViewAddItem(false)}>
        <ModalContent>
        <ModalHeader>
          <h3>Add New Product Category</h3>
        </ModalHeader>
        <ModalBody>
          <Input
            required
            fullWidth
            label="Category Name"
            placeholder="Electronics"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleAddProductCategory}>Create</Button>
          <Button onClick={() => setViewAddItem(false)}>Close</Button>
        </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Product Category Modal */}
      <Modal isOpen={viewEditItem} onClose={() => setViewEditItem(false)}>
      <ModalContent>
        <ModalHeader>
          <h3>Edit Product Category</h3>
        </ModalHeader>
        <ModalBody>
          <Input
            required
            fullWidth
            label="Category Name"
            placeholder="Electronics"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleUpdateProductCategory}>Update</Button>
          <Button onClick={() => {setViewEditItem(false);
            setCategoryName('');}
          }>Close</Button>
        </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Main View */}
      <div>
        {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Product Categories</h4>
          <Button onClick={() => setViewAddItem(true)} icon={<IconSquareRoundedPlus />}>
            Add
          </Button>
        </div> */}

<div
                className="sticky top-0 overflow-hidden h-fit w-full items-center justify-between rounded-t-2xl bg-white px-4 pb-[20px] pt-4 shadow-2xl shadow-gray-100 dark:!bg-navy-700 dark:shadow-none"
                >
                <h1 className="text-3xl font-bold text-purple-800 dark:text-white">
                Product Categories
                </h1>
                <button
                    className=" absolute top-4 right-0 linear rounded-[20px] bg-purple-400 px-4 py-2 text-base font-medium text-brand-500 transition duration-200  hover:bg-purple-500 active:bg-purple-500 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20"
                    onClick={() => { open;
                      console.log("Opening Add Product Modal");
                      setViewAddItem(true);
                    }}
               
               >
                    Add Product Categories
                </button>
                </div>
        <Spacer y={1} />
        <div>
          <Table
            aria-label="Product Categories Table"
            style={{
              height: "auto",
              minWidth: "100%",
            }}
          >
            <TableHeader>
              <TableColumn style={{textAlign: "center" }}>
                Product Category
              </TableColumn>
              <TableColumn style={{textAlign: "center" }}>Status</TableColumn>
              <TableColumn children={undefined} />
            </TableHeader>
            <TableBody className="overflow-y-auto" >{rows}</TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}