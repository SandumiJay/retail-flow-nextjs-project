import axios from "axios";
import React, { useEffect, useState } from "react";
import API_ENPOINTS from "../../API";
import {
  Button,
  Checkbox,
  Flex,
  Group,
  Modal,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import {
  IconEdit,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { countries } from "../../staticData/Countries";
// import { showNotification } from '@mantine/notifications';
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
const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [EntryCode, setEntryCode] = useState(""); // eslint-disable-line
  const [viewEditItem, setViewEditItem] = React.useState(false);
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [viewDeleteItem, setViewDeleteItem] = React.useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(
    null
  );
  const [supTblRows, setSupTblRows] = React.useState<JSX.Element[]>([]);

  const form = useForm({
    initialValues: {
      code: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Sri Lanka",
    },

    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });
  const handleEditViewModal = (supplier: Supplier) => {
    setViewEditItem(true);
    setEditingSupplier(supplier);
    form.setValues({
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.address,
      country: supplier.address,
    });
  };
  const loadSuppliers = async () => {
    setSupTblRows([]);
    try {
      const response = await axios.get(API_ENPOINTS.GET_SUPPLIERS);
      if (Array.isArray(response.data)) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadEntryCode = async () => {
    try {
      const response = await axios.post(API_ENPOINTS.GET_RECIEPT_ENTRY_CODE, {
        codeType: 2,
      });
      console.log(response.data);
      setEntryCode(response.data);
    } catch (error) {
      console.log(error);
    }
  };

const handleDeleteConfirm = (supplier: Supplier) => () => {
    setEditingSupplier(supplier);
    setViewDeleteItem(true);
}

  useEffect(() => {
    setSupTblRows([]);
    const rows = suppliers.map((supplier) => (
      <Table.Tr key={supplier.code}>
        <Table.Td style={{ textAlign: "left" }}>{supplier.code}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{supplier.name}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{supplier.email}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{supplier.phone}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{supplier.address}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{supplier.city}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{supplier.country}</Table.Td>
        <Table.Td
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "end",
            padding: "10px",
          }}
        >
          <Button onClick={() => handleEditViewModal(supplier)}>
            <IconEdit />
          </Button>
          <Button color="red" onClick={handleDeleteConfirm(supplier)}>
            <IconTrashX />
          </Button>
        </Table.Td>
      </Table.Tr>
    ));
    setSupTblRows(rows);
  }, [suppliers]); // eslint-disable-line
  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleDialogOpenCheck = (e) => {
    console.log(e.currentTarget.checked);
    setKeepDialogOpen(e.currentTarget.checked);
  };
  const handleSupplierAdd = async (values: typeof form.values) => {
    console.log(values);
    const {  name, email, phone, address, city, country } = values;
    try {
      await axios.post(API_ENPOINTS.ADD_SUPPLIER, {
        name,
        email,
        phone,
        address,
        city,
        country,
        status: 1,
      });
      console.log("keep opn"+keepDialogOpen)
      if (!keepDialogOpen) {
        setViewAddItem(false);
      }
      setEntryCode("");
      form.reset();
      loadSuppliers();
    } catch (error) {
      console.log(error);
    }
  };
  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>Supplier Code</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Supplier Name</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Email</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Phone</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Address</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>City</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Country</Table.Th>
      <Table.Th style={{ textAlign: "left" }}></Table.Th>
    </Table.Tr>
  );

  const handleUpdateSupplier =  async() => {
    try {
        await axios.put(`${API_ENPOINTS.UPDATE_SUPPLIER}`, form.values);
        setViewEditItem(false);
        loadSuppliers();
    } catch (error) {
        console.log(error);
    }
  };

  const handleSupplierDeleteProceed = async() => {
      try {
        const response = await axios.post(API_ENPOINTS.DELETE_SUPPLIER ,{ // eslint-disable-line
            supplier: editingSupplier
        });

        loadSuppliers();
        setViewDeleteItem(false);
      } catch (error) {
        console.log(error)
      }
  }
  const handleAddSupplierModal = () => {
    const nextCode = loadEntryCode();
    console.log(nextCode);
    form.reset();
    form.setValues({
      country: "Sri Lanka",
    });
    setViewAddItem(true);
  };
  return (
    <div>
        <Modal  opened={viewDeleteItem}
        onClose={() => setViewDeleteItem(false)}
        title="Delete Supplier"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}>
            <p>Are you sure you want to delete {editingSupplier?.name} supplier ?</p>
            <Group>
            <Button type="submit" color="red" onClick={handleSupplierDeleteProceed}>
              Delete
            </Button>
            <Button onClick={() => setViewDeleteItem(false)} color="gray">
              Close
            </Button>
            </Group>
        </Modal>
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add new supplier"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleSupplierAdd)}>
          <Group>
            {/* <TextInput
              withAsterisk
              label="Spplier Code"
              placeholder="SP00001"
              value={EntryCode}
              readOnly
            /> */}
            <TextInput
              style={{ width: "100%" }}
              withAsterisk
              label="Supplier Name"
              placeholder="Supplier Name"
              {...form.getInputProps("name")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Email"
              placeholder="Email"
              type="email"
              style={{ width: "100%" }}
              {...form.getInputProps("email")}
            />
            <TextInput
              withAsterisk
              label="Phone"
              placeholder="+74 XXXXXXXX"
              style={{ width: "100%" }}
              {...form.getInputProps("phone")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Address"
              placeholder="Address"
              style={{ width: "100%" }}
              {...form.getInputProps("address")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="City"
              placeholder="City"
              {...form.getInputProps("city")}
            />
            <Select
              label="Country"
              placeholder="select country"
              data={countries}
              defaultValue={"Sri Lanka"}
              {...form.getInputProps("country")}
            />
          </Group>
          <Group style={{ marginTop: "35px" }}>
            <Checkbox
              label="Keep the form open after saving the produst for next entry"
              onChange={handleDialogOpenCheck}
            />
          </Group>
          <Group justify="flex-start" mt="md">
            <Button type="submit" color="green">
              Add
            </Button>
            <Button onClick={() => setViewAddItem(false)} color="red">
              Close
            </Button>
          </Group>
        </form>
      </Modal>
      <Modal
        opened={viewEditItem}
        onClose={() => setViewEditItem(false)}
        title="Edit Supplier"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleUpdateSupplier)}>
          <Group>
            <TextInput
              
              label="Spplier Code"
              placeholder="SP00001"
              {...form.getInputProps("code")}
              readOnly
            />
            <TextInput
              style={{ width: "100%" }}
              withAsterisk
              label="Supplier Name"
              placeholder="Supplier Name"
              {...form.getInputProps("name")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Email"
              placeholder="Email"
              type="email"
              style={{ width: "100%" }}
              {...form.getInputProps("email")}
            />
            <TextInput
              withAsterisk
              label="Phone"
              placeholder="+74 XXXXXXXX"
              style={{ width: "100%" }}
              {...form.getInputProps("phone")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Address"
              placeholder="Address"
              style={{ width: "100%" }}
              {...form.getInputProps("address")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="City"
              placeholder="City"
              {...form.getInputProps("city")}
            />
            <Select
              label="Country"
              placeholder="select country"
              data={countries}
              defaultValue={"Sri Lanka"}
              {...form.getInputProps("country")}
            />
          </Group>
         
         
          <Group justify="flex-start" mt="md">
            <Button type="submit" color="green">
              Update
            </Button>
            <Button onClick={() => setViewAddItem(false)} color="red">
              Close
            </Button>
          </Group>
        </form>
      </Modal>
      <Flex justify="space-between" align="center">
        <h4>Suppliers / Vendors</h4>
        <Button onClick={handleAddSupplierModal} color="green">
          <IconSquareRoundedPlus />
        </Button>
      </Flex>
      <Table striped highlightOnHover>
        <Table.Thead>{headers}</Table.Thead>
        <Table.Tbody>{supTblRows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default Suppliers;
