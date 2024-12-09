"use client"
import { title } from "@/components/primitives";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table, TableCell, TableRow, TableHeader,TableBody, Image, Badge, TableColumn, Modal, Button } from "@nextui-org/react";
import API_ENPOINTS from "../../API";

interface Product {
  sku: string;
  productName: string;
  category: string;
  intQty: number;
  cost: number;
  price: number;
  image?: string;
}

export default function InventoryPage() {
  const [viewAddItem, setViewAddItem] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <Modal
        isOpen={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add New Item"
        size="lg"
        radius='sm'
        // transitionProps={{ transition: "fade", duration: 200 }}
      >
        <div style={{ padding: "20px", backgroundColor: "gray" }}>
          <h1>Add a new product</h1>
          {/* Add form for new product */}
        </div>
      </Modal>

      {/* Using div for layout */}
    

      <Table
        aria-label="Product Inventory"
        captionSide="top"
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
      >
        <TableHeader>
          <TableColumn style={{ textAlign: "left" }}>SKU</TableColumn>
          <TableColumn style={{ textAlign: "left" }}>Product Name</TableColumn>
          <TableColumn style={{ textAlign: "left" }}>Product Image</TableColumn>
          <TableColumn style={{ textAlign: "left" }}>Category</TableColumn>
          <TableColumn style={{ textAlign: "right" }}>Available Quantity</TableColumn>
          <TableColumn style={{ textAlign: "right" }}>Cost Price</TableColumn>
          <TableColumn style={{ textAlign: "right" }}>Selling Price</TableColumn>
          <TableColumn style={{ textAlign: "right" }}>Stock Status</TableColumn>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.sku} style={{ border: "1px solid #dee2e6" }}>
              <TableCell style={{ textAlign: "left", padding: "10px" }}>{product.sku}</TableCell>
              <TableCell style={{ textAlign: "left", padding: "10px" }}>{product.productName}</TableCell>
              <TableCell style={{ textAlign: "left", padding: "10px" }}>
                {product.image ? (
                  <Image
                    radius="md"
                    height={50}
                    width="auto"
                    src={product.image}
                    style={{ border: "1px solid #dee2e6" }}
                  />
                ) : (
                  <Badge color="secondary">No Image</Badge>
                )}
              </TableCell>
              <TableCell style={{ textAlign: "left", padding: "10px" }}>{product.category}</TableCell>
              <TableCell style={{ textAlign: "right", padding: "10px" }}>{product.intQty}</TableCell>
              <TableCell style={{ textAlign: "right", padding: "10px" }}>${product.cost.toFixed(2)}</TableCell>
              <TableCell style={{ textAlign: "right", padding: "10px" }}>${product.price.toFixed(2)}</TableCell>
              <TableCell style={{ display: "flex", gap: "5px", justifyContent: "end", padding: "10px" }}>
                {product.intQty === 0 ? (
                  <Badge color="danger">Out of Stock</Badge>
                ) : product.intQty < 50 ? (
                  <Badge color="warning">Low in Stock</Badge>
                ) : (
                  <Badge color="success">In Stock</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}