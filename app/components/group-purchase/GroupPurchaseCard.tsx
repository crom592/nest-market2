import { useState } from "react";
import Image from "next/image";
import { GroupPurchase } from "../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface GroupPurchaseCardProps {
  purchase: GroupPurchase;
}

export default function GroupPurchaseCard({ purchase }: GroupPurchaseCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    console.log(`${isFavorite ? "찜 해제" : "찜하기"}: ${purchase.id}`);
  };

  const handleParticipate = () => {
    console.log("공구 참여:", purchase.id);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Image
          src={purchase.imageUrl}
          alt={purchase.title}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
        <button
          className={`absolute top-2 right-2 w-8 h-8 rounded-full ${
            isFavorite ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
          }`}
          onClick={handleFavoriteToggle}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold mb-2">{purchase.title}</h3>
        <div className="mb-2">
          <Progress value={(purchase.currentParticipants / purchase.maxParticipants) * 100} />
        </div>
        <p className="text-sm mb-2">
          참여인원: {purchase.currentParticipants}/{purchase.maxParticipants}명
        </p>
        <p className="text-sm text-gray-500">남은시간: {purchase.remainingTime}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleParticipate} className="w-full">
          공구 참여하기
        </Button>
      </CardFooter>
    </Card>
  );
}