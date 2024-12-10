'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from "@/components/ui/input";

type GroupPurchase = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
};

export default function GroupPurchaseManagement() {
  const [purchases, setPurchases] = useState<GroupPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/group-purchases');
      if (!response.ok) {
        throw new Error('Failed to fetch group purchases');
      }
      const data = await response.json();
      setPurchases(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: '공구 제목',
        description: '공구 설명',
        targetPrice: '목표 가격',
        minParticipants: '최소 참여자 수',
        maxParticipants: '최대 참여자 수',
        category: '카테고리',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'group_purchase_template.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const response = await fetch('/api/admin/group-purchases/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purchases: jsonData }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to upload group purchases');
        }

        await fetchPurchases();
        alert('공구가 성공적으로 등록되었습니다.');
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process Excel file');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>공구 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="text-lg">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      DRAFT: 'secondary',
      ACTIVE: 'default',
      CLOSED: 'destructive',
    };
    const labels: Record<string, string> = {
      DRAFT: '임시저장',
      ACTIVE: '진행중',
      CLOSED: '종료',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>공구 관리</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Button onClick={downloadTemplate}>템플릿 다운로드</Button>
          <div className="relative">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Button variant="outline">엑셀 업로드</Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.title}</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell>
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(`/admin/group-purchases/${purchase.id}`);
                      }}
                    >
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
