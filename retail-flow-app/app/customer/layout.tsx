export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex w-full">
    {/* Main Content Area */}
    <div className="xl:ml-50 xl:pl-0 xl:w-full xl:flex xl:flex-col mt-5 mx-2">
      {children}
    </div>
  </section>
  );
}
