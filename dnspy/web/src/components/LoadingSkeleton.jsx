import { Card, CardBody } from "@nextui-org/react";

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-[120px]">
            <CardBody className="space-y-3 p-6">
              <div className="h-3 bg-default-200 rounded w-24" />
              <div className="h-8 bg-default-200 rounded w-16" />
              <div className="h-2 bg-default-200 rounded w-32" />
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="h-[400px]">
            <CardBody className="p-6">
              <div className="h-5 bg-default-200 rounded w-48 mb-6" />
              <div className="h-[320px] bg-default-200 rounded" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}