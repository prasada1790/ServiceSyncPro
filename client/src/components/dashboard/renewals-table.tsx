import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenewalWithRelations } from "@shared/schema";
import { formatDate, formatCurrency, getRenewalStatus } from "@/lib/utils";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RenewalsTableProps {
  renewals: RenewalWithRelations[];
  isLoading?: boolean;
}

export function RenewalsTable({ renewals = [], isLoading = false }: RenewalsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upcoming Renewals</CardTitle>
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="-mx-5 mt-2">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Client
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-gray-200 px-5 py-4">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">Upcoming Renewals</CardTitle>
          <Link href="/renewals">
            <Button variant="outline" size="sm" className="h-8 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <div className="-mx-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Service</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {renewals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-4 text-center text-sm text-gray-500">
                      No upcoming renewals found
                    </td>
                  </tr>
                ) : (
                  renewals.map((renewal) => {
                    const status = getRenewalStatus(renewal.endDate, renewal.isPaid);
                    
                    return (
                      <tr key={renewal.id}>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-900">
                          <div className="font-medium">{renewal.client.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {renewal.service.name}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {formatDate(renewal.endDate)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {formatCurrency(renewal.amount)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm">
                          <Badge 
                            variant="outline" 
                            className={`${status.color} border-0 font-semibold rounded-full`}
                          >
                            {status.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
