"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Input,
  Button,
  Table,
  Modal,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  Select,
  Checkbox,
  useDisclosure,
  ModalContent,
  SelectItem,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";
import { IconEye, IconTrashX, IconSquareRoundedPlus, IconEdit } from "@tabler/icons-react";
import API_ENDPOINTS from "../../API";
import { countries } from "@/app/data/Countries";

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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [EntryCode, setEntryCode] = useState(""); // eslint-disable-line
  const [viewEditItem, setViewEditItem] = useState(false);
  const [viewAddItem, setViewAddItem] = useState(false);
  const [viewDeleteItem, setViewDeleteItem] = useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supTblRows, setSupTblRows] = useState<JSX.Element[]>([]);
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
  });

  const handleEditViewModal = (supplier: Supplier) => {
    setViewEditItem(true);
    setEditingSupplier(supplier);
    setFormValues({
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
    });
  };

  const loadSuppliers = async () => {
    setSupTblRows([]);
    try {
      const response = await axios.get(API_ENDPOINTS.GET_SUPPLIERS);
      if (Array.isArray(response.data)) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadEntryCode = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.GET_RECIEPT_ENTRY_CODE, {
        codeType: 2,
      });
      setEntryCode(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteConfirm = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setViewDeleteItem(true);
  };

  useEffect(() => {
    setSupTblRows(
      suppliers.map((supplier) => (
        <TableRow key={supplier.code}>
          <TableCell>{supplier.code}</TableCell>
          <TableCell>{supplier.name}</TableCell>
          <TableCell>{supplier.email}</TableCell>
          <TableCell>{supplier.phone}</TableCell>
          <TableCell>{supplier.address}</TableCell>
          <TableCell>{supplier.city}</TableCell>
          <TableCell>{supplier.country}</TableCell>
          <TableCell>
            <Button color="default" onClick={() => handleEditViewModal(supplier)}>
              <IconEdit />
            </Button>
            <Button color="secondary" onClick={() => handleDeleteConfirm(supplier)}>
              <IconTrashX />
            </Button>
          </TableCell>
        </TableRow>
      ))
    );
  }, [suppliers]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleDialogOpenCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeepDialogOpen(e.currentTarget.checked);
  };

  const handleSupplierAdd = async () => {
    const { name, email, phone, address, city, country } = formValues;
    try {
      await axios.post(API_ENDPOINTS.ADD_SUPPLIER, {
        name,
        email,
        phone,
        address,
        city,
        country,
        status: 1,
      });
      if (!keepDialogOpen) {
        setViewAddItem(false);
      }
      setEntryCode("");
      setFormValues({
        code: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "Sri Lanka",
      });
      loadSuppliers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(API_ENDPOINTS.UPDATE_SUPPLIER, formValues);
      setViewEditItem(false);
      loadSuppliers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSupplierDeleteProceed = async () => {
    try {
      await axios.post(API_ENDPOINTS.DELETE_SUPPLIER, { supplier: editingSupplier });
      loadSuppliers();
      setViewDeleteItem(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSupplierModal = () => {
    loadEntryCode();
    setFormValues({
      code: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "Sri Lanka",
    });
    setViewAddItem(true);
  };

  return (
    <div>
      {/* Delete Modal */}
      <Modal isOpen={viewDeleteItem} onClose={() => setViewDeleteItem(false)}>
        <ModalContent>
        <p>Are you sure you want to delete {editingSupplier?.name} supplier?</p>
        <Button color="danger" onClick={handleSupplierDeleteProceed}>
          Delete
        </Button>
        <Button onClick={() => setViewDeleteItem(false)}>Close</Button>
        </ModalContent>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={viewAddItem} onClose={() => setViewAddItem(false)}>
        <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Add Supplier</ModalHeader>
        <ModalBody>
        <form>
          <Input
            label="Supplier Name"
            value={formValues.name}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            className="flex flex-col gap-1 pb-4"
            
          />
           <div>
           <Input
            label="Email Address"
            value={formValues.email}
            onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
             className="flex flex-col gap-1 pb-4"
          />
            <Input
            label="Contact Number"
            value={formValues.phone}
            onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
             className="flex flex-col gap-1 pb-4"
          />

          </div>
          <div>
          <Input
            label="Address"
            value={formValues.address}
            onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
             className="flex flex-col gap-1 pb-4"
          />
          </div>
          <div>

          <div className="flex flex-row space-x-4">
          <div className="relative z-0 w-full mb-5">  
          <Input
            label="City"
            value={formValues.city}
            onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
             className="flex flex-col gap-1 pb-4"
          />
           </div>
           <div className="relative z-0 w-full mb-5">
            <Select
              label="Country"
              placeholder="select country"
              items={countries}
              onChange={(e) => setFormValues({ ...formValues, country: e.target.value })}
               className="flex flex-col gap-1 pb-4"
            >
                   {countries.map((country) => (
        <SelectItem key={country.value}>
          {country.label}
        </SelectItem>
      ))}
                </Select>
                </div>
                </div>

          </div>
          {/* <div style={{ marginTop: "35px" }}>
            <Checkbox
              onChange={handleDialogOpenCheck}
            >Keep the form open after saving the produst for next entry</Checkbox>
          </div> */}
          
        </form>
        <div className="flex flex-row space-x-4">
        <div className="relative z-0 w-full mb-5 pl-10">  
        <Button type="submit" onClick={()=>handleSupplierAdd()}>Add</Button>
            </div>
            <div className="relative z-0 w-full mb-5 pl-10">  
          <Button color="secondary" onClick={() => setViewAddItem(false)}>Close</Button>
          </div>
          </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={viewEditItem} onClose={() => setViewEditItem(false)}>
        <ModalContent> 
        <ModalHeader className="flex flex-col gap-1">Edit Supplier</ModalHeader>
        <ModalBody>
        <form onSubmit={handleUpdateSupplier}>
          <Input
            label="Supplier Name"
            value={formValues.name}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
            className="flex flex-col gap-1 pb-4"
          />
          <div>
           <Input
            label="Email Address"
            value={formValues.email}
            onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
            className="flex flex-col gap-1 pb-4"
          />
            <Input
            label="Contact Number"
            value={formValues.phone}
            onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
            className="flex flex-col gap-1 pb-4"
          />

          </div>
          <div>
          <Input
            label="Address"
            value={formValues.address}
            onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
            className="flex flex-col gap-1 pb-4"
          />
          </div>
          <div>
          <Input
            label="City"
            value={formValues.city}
            onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
            className="flex flex-col gap-1 pb-4"
          />
            <Select
              label="Country"
              placeholder="select country"
              defaultSelectedKeys={formValues.country}
              items={countries}
              onChange={(e) => setFormValues({ ...formValues, country: e.target.value })}
              className="flex flex-col gap-1 pb-4"
            >
                   {countries.map((country) => (
        <SelectItem key={country.value}>
          {country.label}
        </SelectItem>
      ))}
                </Select>

          </div>
          <Button type="submit">Update</Button>
          <Button onClick={() => setViewEditItem(false)} color="secondary">Close</Button>
        </form>
        </ModalBody>
        </ModalContent>
      </Modal>

      {/* Table */}
      <div
                className="sticky top-0 overflow-hidden h-fit w-full items-center justify-between rounded-t-2xl bg-white px-4 pb-[20px] pt-4 shadow-2xl shadow-gray-100 dark:!bg-navy-700 dark:shadow-none"
                >
                <h1 className="text-3xl font-bold text-purple-800 dark:text-white">
                Suppliers
                </h1>
                <button
                    className=" absolute top-4 right-0 linear rounded-[20px] bg-purple-400 px-4 py-2 text-base font-medium text-brand-500 transition duration-200  hover:bg-purple-500 active:bg-purple-500 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20"
                    onClick={() => { open;
                      console.log("Opening Add Product Modal");
                      setViewAddItem(true);
                    }}
               
               >
                    Add Suppliers
                </button>
                </div>
                <div className="container absolute inset-25 w-full max-w-[1375px]">
      <Table className="text-center w-full max-h-[700px]">
        <TableHeader className="sticky top-0 overflow-hidden w-full mb-4">
          <TableColumn className="p-4 w-1/8">Supplier Code</TableColumn>
          <TableColumn className="p-4 w-1/8">Supplier Name</TableColumn>
          <TableColumn className="p-4 w-1/6">Email</TableColumn>
          <TableColumn className="p-4 w-1/6">Phone</TableColumn>
          <TableColumn className="p-4 w-1/6">Address</TableColumn>
          <TableColumn className="p-4 w-1/6">City</TableColumn>
          <TableColumn className="p-4 w-1/6">Country</TableColumn>
          <TableColumn className="p-4 w-1/6" children={undefined}></TableColumn>
         
        </TableHeader>
        <TableBody>{supTblRows}</TableBody>
      </Table>
      </div>
    </div>
  );
}