"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAvailableBatches } from "@/app/actions/sales";
import { formatDate } from "@/lib/utils";

interface BatchSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  quantity: number;
  conversionFactor: number;
  onSelect: (batch: any) => void;
}

export function BatchSelector({
  open,
  onOpenChange,
  product,
  quantity,
  conversionFactor,
  onSelect,
}: BatchSelectorProps) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (open && product?.id) {
      loadBatches();
    }
  }, [open, product?.id]);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const result = await getAvailableBatches(product.id);
      if (result.success) {
        setBatches(result.data);
      }
    } catch (error) {
      console.error("Error loading batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const neededQuantity = quantity * conversionFactor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chọn lô cho: {product?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : batches.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Không còn lô nào còn hàng cho sản phẩm này!
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="text-sm text-muted-foreground">
                Cần lấy: <span className="font-bold text-primary">{neededQuantity} {product?.base_unit}</span>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-auto">
                {batches.map((batch) => {
                  const isAvailable = batch.quantity >= neededQuantity;
                  const isSelected = selectedBatchId === batch.id;

                  return (
                    <div
                      key={batch.id}
                      className={`p-3 border rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : isAvailable
                          ? "hover:border-primary/50"
                          : "opacity-50 cursor-not-allowed bg-muted/30"
                      }`}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedBatchId(batch.id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Lô: {batch.batch_number}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              HSD: {formatDate(batch.expiry_date)}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Package className="h-3.5 w-3.5" />
                              Còn: {batch.quantity} {product?.base_unit}
                            </span>
                          </div>
                        </div>
                        {!isAvailable && (
                          <Badge variant="destructive" className="text-xs">
                            Không đủ
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    const selected = batches.find(b => b.id === selectedBatchId);
                    if (selected) {
                      onSelect(selected);
                      onOpenChange(false);
                    }
                  }}
                  disabled={!selectedBatchId}
                >
                  Xác nhận
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}