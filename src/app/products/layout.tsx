export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container mx-auto py-6 px-4 md:px-6">{children}</div>;
}
