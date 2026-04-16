import ErrorBoundary from "@/components/ErrorBoundary";

export default function HouseLayout({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
