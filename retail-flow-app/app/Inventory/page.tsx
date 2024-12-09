"use client";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Inventory() {
  const router = useRouter();   

  const list = [
    // {
    //   title: "Inventory",
    //   img: "/Warehouse-1--Streamline-Core-Remix.svg",
    //   href: 'Inventory/inventory',
    // },
    {
      title: "Products",
      img: "/Shopping-Basket-2--Streamline-Sharp-Remix.svg",
      href: 'Inventory/Products',
    },
    {
      title: "Product Categories",
      img: "/Tag--Streamline-Flex.svg",
      href: 'Inventory/ProductCategories',
    },
    {
      title: "Purchase Order",
      img: "/Shopping-Cart-Download--Streamline-Ultimate.svg",
      href: 'Inventory/PurchaseOrder',
    },
    {
      title: "Supplier",
      img: "/Business-Product-Supplier-1--Streamline-Freehand.svg",
      href: 'Inventory/Suppliers',
    },
  ];

  return (
    <div className="container mx-auto px-[12px] md:px-24 xl:px-12 max-w-[1300px] nanum2">
      <h1 className="text-center text-5xl pb-12 pt-20">Inventory</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-x-4 gap-y-28 lg:gap-y-16">
        {list.map((item, index) => (
          <div key={index} className="relative group h-48 flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
            <div className="gap-2 grid grid-cols-1 lg:grid-cols-1 h-full w-full">
              <Card radius="lg" isPressable className="absolute -top-20 lg:top-[-0%] left-[5%] z-20 group-hover:top-[-40%] group-hover:opacity-[0.9] duration-100 w-[90%] h-100 bg-purple-500 rounded-xl justify-items-center align-middle" onClick={() => router.push(item.href)}>
                <CardBody className="flex justify-center items-center">
                  <Image
                    // shadow="sm"
                    radius="sm"
                    width="100%"
                    alt={`Image for ${item.title}`} // Improved alt text
                    className="object-cover h-[160px]"
                    src={item.img}
                  />
                </CardBody>
                <CardFooter className="text-small text-center text-white">
                  {/* <b>{item.title}</b> */}
                </CardFooter>
              </Card>
              {/* <div style={{ height: '200px' }}></div> */}
              <div className="p-6 z-10 w-full">
              <div style={{ height: '120px' }}></div>
                        <p
                            className="mb-2 inline-block text-tg text-center w-full  text-xl  font-sans  font-semibold leading-snug tracking-normal   antialiased">
                            {item.title}
                        </p>
                    </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
