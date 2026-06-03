import Axios from "@/lib/axios-config";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface PresignPayload {
  applicationId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface UploadPayload {
  applicationId: string;
  documentType: string;
  s3Key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      applicationId,
      documentType,
    }: {
      file: File;
      applicationId: string;
      documentType: string;
    }) => {
      let s3Key = "";
      let presignUrl = "";

      const presignPayload: PresignPayload = {
        applicationId,
        documentType,
        fileName: file.name,
        contentType: file.type || "application/pdf",
        fileSize: file.size,
      };

      try {
        const { data: presignRes } = await Axios.post<any>(
          `/api/v1/documents/presign`,
          presignPayload,
        );
        const result = presignRes?.data || presignRes;
        s3Key = result?.s3Key || result?.key;
        presignUrl = result?.url || result?.uploadUrl || result?.presignedUrl;
      } catch (err) {
        console.error("Presign failed, falling back to random s3Key", err);
      }

      if (!s3Key) {
        s3Key = `documents/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      }

      if (presignUrl) {
        try {
          await fetch(presignUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type || "application/pdf",
            },
          });
        } catch (uploadErr) {
          console.error("Direct S3 upload failed", uploadErr);
        }
      }

      const uploadPayload: UploadPayload = {
        applicationId,
        documentType,
        s3Key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
      };

      const { data: res } = await Axios.post<any>(`/api/v1/documents`, uploadPayload);
      return res;
    },
    onSuccess: (res) => {
      console.log("res", res);
      toast.success(res?.message || "Document uploaded successfully");
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATIONS],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LEADS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_APPLICATION_BY_ID, res.applicationId],
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to upload document";
      toast.error(errorMessage);
    },
  });
};
