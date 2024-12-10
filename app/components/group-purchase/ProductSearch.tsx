'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  model?: string;
  description?: string;
  category: string;
  imageUrl?: string;
}

interface ProductSearchProps {
  onSelect: (product: Product) => void;
  className?: string;
}

export default function ProductSearch({ onSelect, className }: ProductSearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('검색 중 오류가 발생했습니다.');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Failed to search products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleManualInput = () => {
    if (!searchTerm.trim()) return;
    
    const newProduct: Product = {
      id: `manual-${Date.now()}`,
      name: searchTerm,
      category: '직접입력',
    };
    
    onSelect(newProduct);
    setOpen(false);
    setValue("");
    setSearchTerm("");
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || "제품/서비스 검색..."}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder="제품/서비스명을 입력하세요..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>
              {loading ? (
                <p className="py-6 text-center text-sm text-gray-500">검색 중...</p>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
                  <Button
                    variant="ghost"
                    className="mt-2"
                    onClick={handleManualInput}
                  >
                    직접 입력하기
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    setValue(product.name);
                    onSelect(product);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-8 w-8 rounded object-cover mr-2"
                      />
                    )}
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.model && (
                        <p className="text-sm text-gray-500">
                          모델명: {product.model}
                        </p>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {value && (
        <div className="mt-4 p-4 border rounded-lg">
          <h4 className="font-medium mb-2">도움말</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 제품/서비스명은 정확하게 입력해주세요.</li>
            <li>• 모델명이 있는 경우 함께 입력하면 좋습니다. (예: 갤럭시 S24 Ultra)</li>
            <li>• 직접 입력 시 카테고리를 선택해주세요.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
