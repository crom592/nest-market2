import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function FilterBar() {
  const [sortBy, setSortBy] = useState("popularity");
  const [category, setCategory] = useState("all");

  const handleFilter = () => {
    console.log("Filtering with:", { sortBy, category });
    // TODO: API 호출 로직 추가
  };

  return (
    <div className="flex items-center justify-between py-4">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="정렬 기준" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popularity">인기순</SelectItem>
          <SelectItem value="remainingTime">마감임박순</SelectItem>
          <SelectItem value="participantCount">참여인원순</SelectItem>
        </SelectContent>
      </Select>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="카테고리" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          <SelectItem value="electronics">전자제품</SelectItem>
          <SelectItem value="fashion">패션</SelectItem>
          <SelectItem value="home">홈/리빙</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleFilter}>필터 적용</Button>
    </div>
  );
}