import axios from "axios";
import React, { useEffect, useState } from "react";
import 
API_ENPOINTS from "../../API";
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
const Customers: React.FC = () => {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [EntryCode, setEntryCode] = useState("");
  const [viewEditItem, setViewEditItem] = React.useState(false);
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [viewDeleteItem, setViewDeleteItem] = React.useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(
    null
  );
  const [supTblRows, setSupTblRows] = React.useState<JSX.Element[]>([]);

  const form = useForm({
    initialValues: {
      code: "",
      name: "",
      email: "",
      contact: "",
      address: "",
      city: "",
      country: "Sri Lanka",
      status: 0,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });
  const handleEditViewModal = (customers: Customer) => {
    setViewEditItem(true);
    setEditingCustomer(customers);
    form.setValues({
      code: customers.code,
      name: customers.name,
      email: customers.email,
      contact: customers.contact,
      address: customers.address,
      city: customers.city,
      country: customers.country,
      status: customers.status
    });
  };
  const loadCustomers = async () => {
    setSupTblRows([]);
    try {
      const response = await axios.get(API_ENPOINTS.GET_CUSTOMERS);
      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withTimeout = (promise, timeout) => { // eslint-disable-line
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      )
    ]);
  };
  

  const loadEntryCode = async () => {
    try {
      const response = await axios.post(API_ENPOINTS.GET_RECIEPT_ENTRY_CODE, {
        codeType: 5,
      });
      console.log(response.data);
      setEntryCode(response.data);
    } catch (error) {
      console.log(error);
    }
  };

const handleDeleteConfirm = (customer: Customer) => () => {
    setEditingCustomer(customer);
    setViewDeleteItem(true);
}

  useEffect(() => {
    setSupTblRows([]);
    const rows = customers.map((customers) => (
      <Table.Tr key={customers.code}>
        <Table.Td style={{ textAlign: "left" }}>{customers.code}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{customers.name}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{customers.email}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{customers.contact}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{customers.address}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{customers.city}</Table.Td>
        <Table.Td style={{ textAlign: "left" }}>{customers.country}</Table.Td>
        {/* <Table.Td style={{ textAlign: "left" }}>{customers.status}</Table.Td> */}
        <Table.Td
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "end",
            padding: "10px",
          }}
        >
          <Button onClick={() => handleEditViewModal(customers)}>
            <IconEdit />
          </Button>
          <Button color="red" onClick={handleDeleteConfirm(customers)}>
            <IconTrashX />
          </Button>
        </Table.Td>
      </Table.Tr>
    ));
    setSupTblRows(rows);
  }, [customers]); // eslint-disable-line
  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDialogOpenCheck = (e) => {
    console.log(e.currentTarget.checked);
    setKeepDialogOpen(e.currentTarget.checked);
  };
  const handleCustomerAdd = async (values: typeof form.values) => {
    console.log(values);
    const { code,name, email, contact, address, city, country } = values; // eslint-disable-line
    try {
      await axios.post(API_ENPOINTS.ADD_CUSTOMER, {
        code: EntryCode,
        name,
        email,
        contact,
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
      loadCustomers();
    } catch (error) {
      console.log(error);
    }
  };
  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>Customer Code</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Customer Name</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Email</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Contact</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Address</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>City</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Country</Table.Th>
      {/* <Table.Th style={{ textAlign: "left" }}>Status</Table.Th> */}
      <Table.Th style={{ textAlign: "left" }}></Table.Th>
    </Table.Tr>
  );

  const handleUpdateCustomer = async () => {
    try {
      console.log(form.values)
      await axios.put(API_ENPOINTS.UPDATE_CUSTOMER, form.values);
      console.log(form.values)
      setViewEditItem(false);
      loadCustomers();
    } catch (error) {
      console.log(error);
    }
  };
  

  const handleCustomerDeleteProceed = async() => {
      try {
        const response = await axios.post(API_ENPOINTS.DELETE_CUSTOMER ,{ // eslint-disable-line
            customers: editingCustomer
        });

        loadCustomers();
        setViewDeleteItem(false);
      } catch (error) {
        console.log(error)
      }
  }
  const handleAddCustomerModal = () => {
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
        title="Delete Customer"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}>
            <p>Are you sure you want to delete {editingCustomer?.name} customer ?</p>
            <Group>
            <Button type="submit" color="red" onClick={handleCustomerDeleteProceed}>
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
        title="Add new customer"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleCustomerAdd)}>
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
              label="Customer Name"
              placeholder="Customer Name"
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
              {...form.getInputProps("contact")}
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
        title="Edit Customer"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
<form onSubmit={form.onSubmit(handleUpdateCustomer)}>
  <Group>
    <TextInput
      label="Customer Code"
      placeholder="SP00001"
      {...form.getInputProps("code")}
      readOnly
    />
    <TextInput
      style={{ width: "100%" }}
      withAsterisk
      label="Customer Name"
      placeholder="Customer Name"
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
      {...form.getInputProps("contact")} // Use contact here
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
    <Button type="submit" color="green" style={{ marginRight: "1rem" }}>
      Update
    </Button>
    <Button onClick={() => setViewEditItem(false)} color="red">
      Close
    </Button>
  </Group>
</form>
      </Modal>
      <Flex justify="space-between" align="center">
        <h4>Customers</h4>
        <Button onClick={handleAddCustomerModal} color="green">
          Add New Customer 
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

export default Customers;
