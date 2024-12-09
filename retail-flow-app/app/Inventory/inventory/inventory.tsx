import { Badge, Button, Flex, Image, Modal, Table } from "@mantine/core"; // eslint-disable-line
import { IconEdit, IconSquareRoundedPlus, IconTrashX } from "@tabler/icons-react"; // eslint-disable-line
import axios from "axios";
import React, { useEffect } from "react";
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


 

const Inventory: React.FC = () => {
  const [viewAddItem, setViewAddItem] = React.useState(false);
  

  const [productTblRows, setProductTblRows] = React.useState<JSX.Element[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
   
  useEffect(() => {
    const rows = products.map((product) => (
      <Table.Tr key={product.sku} style={{ border: "1px solid #dee2e6" }}>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.sku}
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.productName}
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.image ? (
            <Image
              radius="md"
              h={50}
              w="auto"
              fit="contain"
              src={product.image}
              style={{ border: "1px solid #dee2e6" }}
            />
          ) : (
            <Badge color="gray">No Image</Badge>
          )}
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.category}
        </Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>
          {product.intQty}
        </Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>
          ${product.cost.toFixed(2)}
        </Table.Td>

        <Table.Td style={{ textAlign: "right", padding: "10px" }}>
          ${product.price.toFixed(2)}
        </Table.Td>
        <Table.Td
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "end",
            padding: "10px",
          }}
        >
          {product.intQty === 0 ? (
            <Badge color="red">Out of Stock</Badge>
          ) : product.intQty < 50 ? (
            <Badge color="yellow">Low in Stock</Badge>
          ) : (
            <Badge color="green">In Stock</Badge>
          )}
          {/* <Button onClick={() => handleEditViewModal(product)}>
            <IconEdit />
          </Button>
          <Button color="red" onClick={() => hadleDeleteConfirm(product)}>
            <IconTrashX />
          </Button> */}
        </Table.Td>
      </Table.Tr>
    ));

    setProductTblRows(rows);
  }, [products]);
  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>SKU</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Product Name</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Product Image</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Category</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Available Quantity</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Cost Price</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Selling Price</Table.Th>
      <Table.Th>Stock Status</Table.Th>
    </Table.Tr>
  );
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
    }
  };
  useEffect(() => {
    loadProducts();
  }, []);
  return (
    <div>
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="This is a fullscreen modal"
        size="auto"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <div style={{ padding: "20px", backgroundColor: "gray" }}>
          <h1>Add</h1>
        </div>
      </Modal>
      <Flex justify="space-between" align="center">
        <h4>Inventory</h4>
        {/* <Button onClick={() => setViewAddItem(true)} color="green">
          {" "}
          <IconSquareRoundedPlus />
          New Purchase Order
        </Button> */}
      </Flex>

      <div>
        <Table
          captionSide="top"
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
        >
          <thead>{headers}</thead>
          <tbody>{productTblRows}</tbody>
        </Table>
      </div>
    </div>
  );
};

export default Inventory;
