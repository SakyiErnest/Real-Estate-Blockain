// This function helps Next.js understand the type of params for this dynamic route
export async function generateStaticParams() {
  // In a real app, you would fetch the list of property IDs from an API
  // For demo purposes, we'll use static IDs
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}
