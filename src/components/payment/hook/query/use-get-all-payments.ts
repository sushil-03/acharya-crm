import Axios from "@/lib/axios-config";
import { useQuery } from "@tanstack/react-query";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Payment {
  id: string;
  studentId: string;
  offerId: string;
  applicationId: string;
  amount: string;
  currency: string;
  paymentGateway: string;
  gatewayPaymentId: string;
  gatewayOrderId: string | null;
  paymentType: string;
  paymentStatus: string;
  paymentMethod: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string | null;
  paidAt: string | null;
  receiptUrl: string | null;
  invoiceNumber: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  student: Student;
}
export interface PaymentResponse {
  data: Payment[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}
export const useGetAllPayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await Axios.get<PaymentResponse>("/api/v1/payments");
      return data.data;
    },
  });
};
