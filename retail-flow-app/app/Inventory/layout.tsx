export default function InventoryLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      
      <section className="absolute inset-4 bg-white py-8 px-4 xl:px-5"> 
          {children}
        </section>

    );
  }
  