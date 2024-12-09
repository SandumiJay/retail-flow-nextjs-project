import {
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useEffect, useState } from "react";
import API_ENDPOINTS from "../../API"; 
import axios from "axios";  
import "./Products.css";
import {
  IconEdit,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";

interface ProductCategory {
  id: string;
  Category: string;
  Status: number;
}

const ProductCategories: React.FC = () => {
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [viewEditItem, setViewEditItem] = React.useState(false);
  const [viewDelete, setViewDelete] = React.useState(false);
  const [selectedProductCategoryId, setSelectedProductCategoryId] =
    React.useState("");

  const [productCategoryList, setProductCategoryList] = React.useState<ProductCategory[]>([]);
  const [formValues, setFormValues] = useState({
   category: ""
  });

  const loadProductCategories = async () => {
    try {
      const response = await axios.get<{
        success: string;
        data: ProductCategory[];
      }>(API_ENDPOINTS.GET_PRODUCT_CATEGORIES);
      console.log(response.data);
      setProductCategoryList(response.data.data || []); 
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteConfirm = (product: ProductCategory) => {
    setSelectedProductCategoryId(product.id);
    setViewDelete(true);
  };

  const hanldeDeleteProceed = async () => {
    try {
      await axios.delete(API_ENDPOINTS.DELETE_PRODUCT_CATEGORY, {
        params: {
          id: selectedProductCategoryId,
        },
      });
      setViewDelete(false);
      loadProductCategories();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadProductCategories();
  }, []);

  const rows = productCategoryList.map((product) => (
    <tr key={product.id}>
      <td style={{ width: "40%", textAlign: "center" }}>{product.Category}</td>
      <td style={{ width: "40%", textAlign: "center" }}>
        {product.Status === 1 ? (
          <Badge color="blue">Active</Badge>
        ) : (
          <Badge color="red">Inactive</Badge>
        )}
      </td>
      <td style={{ display: "flex", gap: "5px", justifyContent: "flex-end" }}>
        <Button onClick={() => handleEditProductCategory(product.id)}>
          <IconEdit />
        </Button>
        <Button color="red" onClick={() => handleDeleteConfirm(product)}>
          <IconTrashX />
        </Button>
      </td>
    </tr>
  ));

  const headers = (
    <tr>
      <th style={{ width: "50%", textAlign: "center" }}>Product Category</th>
      <th style={{ width: "50%", textAlign: "left" }}>Status</th>
      <th></th>
    </tr>
  );

  const form = useForm({
    initialValues: {
      category: "",
    },
    validate: {
      category: (value) =>
        value ? null : "Value Cannot be Empty",
    },
  });

  const handleProductCategoryUpdate = async (values: { category: string }) => {
    const { category } = values;
    try {
      await axios.put(API_ENDPOINTS.UPDATE_PRODUCT_CATEGORY, {
        id: selectedProductCategoryId,
        category: category,
      });
      form.reset();
      setViewEditItem(false);
      loadProductCategories();
    } catch (error) {
      console.log(error);
    }
  };

  const handleProductCategorySave = async (values: { category: string }) => {
    const { category } = values;
    try {
      await axios.post(API_ENDPOINTS.CREATE_PRODUCT_CATEGORY, {
        category: category,
      });
      form.reset();
      setViewAddItem(false);
      loadProductCategories();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditProductCategory = (id: string) => {
    setSelectedProductCategoryId(id);
    const product = productCategoryList.find((product) => product.id === id);
    form.setValues({
      category: product?.Category || "", // Fallback in case product is undefined
    });
    setViewEditItem(true);
  };

  return (
    <>
      <Modal
        opened={viewDelete}
        onClose={() => setViewDelete(false)}
        title="Delete Product Category"
        size="lg"
      >
        <p>Are you sure you want to delete this product category?</p>
        <Group position="left" mt="md">
          <Button type="submit" color="red" onClick={hanldeDeleteProceed}>
            Delete
          </Button>
          <Button onClick={() => setViewDelete(false)} color="gray">
            Close
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={viewAddItem}
        onClose={() => {
          setViewAddItem(false);
          form.reset(); // Reset form values when closing
        }}
        title="Add new Product Category"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleProductCategorySave)}>
          <TextInput
            withAsterisk
            label="Category Name"
            placeholder="Electronics"
            {...form.getInputProps("category")}
          />
          <Group position="left" mt="md">
            <Button type="submit" color="green">
              Create
            </Button>
            <Button
              onClick={() => {
                setViewAddItem(false);
                form.reset(); // Reset form values when closing
              }}
              color="gray"
            >
              Close
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={viewEditItem}
        onClose={() => {
          setViewEditItem(false);
          form.reset(); // Reset form values when closing
        }}
        title="Edit Product Category"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleProductCategoryUpdate)}>
          <TextInput
            withAsterisk
            label="Category Name"
            placeholder="Electronics"
            {...form.getInputProps("category")}
          />
          <Group position="left" mt="md">
            <Button type="submit" color="green">
              Update
            </Button>
            <Button
              onClick={() => {
                setViewEditItem(false);
                form.reset(); // Reset form values when closing
              }}
              color="gray"
            >
              Close
            </Button>
          </Group>
        </form>
      </Modal>

      <div>
        <Flex justify="space-between" align="center">
          <h4>Product Categories</h4>
          <Button onClick={() => setViewAddItem(true)} color="green">
            <IconSquareRoundedPlus />
          </Button>
        </Flex>
        <div>
          <Table
            captionSide="top"
            striped
            highlightOnHover
            withTableBorder
            className="table-striped-data"
          >
            <thead>{headers}</thead>
            <tbody>{rows}</tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default ProductCategories;